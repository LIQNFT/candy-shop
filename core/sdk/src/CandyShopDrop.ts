import { BN, Idl, Program, Provider, web3 } from '@project-serum/anchor';
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MintLayout,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { EditionDropCommitNftParams, EditionDropMintPrintParams } from '.';
import { EDITION_DROP_PROGRAM_ID } from './factory/constants';
import {
  commitNft,
  CommitNftParams,
  enterpriseCommitNft,
  enterpriseMintPrint,
  mintPrint,
  MintPrintParams
} from './factory/program';
import editionDropIdl from './idl/edition_drop.json';
import {
  CandyShopError,
  CandyShopErrorType,
  getAtaForMint,
  getEditionVaultAccount,
  getNodeWallet,
  safeAwait
} from './vendor';
const EDITION_ARRAY_SIZE = 1250;

// ignore the reserved size here
const VAULT_ACCOUNT_SIZE = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 1 + 32 + EDITION_ARRAY_SIZE;

const MAX_SUPPLY_OFFSET = 8 + 32 + 32 + 8;

export abstract class CandyShopDrop {
  static getProgram(connection: Connection, wallet: AnchorWallet | Keypair): Program<Idl> {
    const options = Provider.defaultOptions();
    const provider = new Provider(
      connection,
      // check the instance type
      wallet instanceof Keypair ? getNodeWallet(wallet) : wallet,
      options
    );

    // @ts-ignore
    return new Program(editionDropIdl, EDITION_DROP_PROGRAM_ID, provider);
  }

  static async commitNft(params: EditionDropCommitNftParams): Promise<string> {
    const {
      isEnterprise,
      connection,
      candyShop,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      nftOwner,
      price,
      startTime,
      salesPeriod,
      whitelistTime,
      candyShopProgram
    } = params;

    const [vaultAccount] = await getEditionVaultAccount(candyShop, nftOwnerTokenAccount);

    const commitNftParams: CommitNftParams = {
      candyShop,
      vaultAccount,
      nftOwner,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      whitelistTime,
      price,
      startTime,
      salesPeriod,
      program: this.getProgram(connection, nftOwner),
      candyShopProgram
    };

    if (isEnterprise) {
      return enterpriseCommitNft(commitNftParams);
    }

    return commitNft(commitNftParams);
  }

  static async mintPrint(params: EditionDropMintPrintParams): Promise<string> {
    const {
      isEnterprise,
      connection,
      candyShop,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      editionBuyer,
      auctionHouse,
      candyShopProgram
    } = params;

    const [vaultAccount] = await getEditionVaultAccount(candyShop, nftOwnerTokenAccount);

    const editionNumber = await generateEditionNumber(vaultAccount, connection);
    console.log('editionNumber ', editionNumber.toString());

    const program = this.getProgram(connection, editionBuyer);

    const { instructions, newEditionMint, newEditionTokenAccount } = await createNewMintInstructions(
      editionBuyer.publicKey,
      connection
    );

    const mintPrintParams: MintPrintParams = {
      candyShop,
      vaultAccount,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      editionBuyer,
      auctionHouse,
      editionNumber,
      newEditionMint,
      newEditionTokenAccount,
      program
    };

    if (isEnterprise) {
      return enterpriseMintPrint(instructions, { ...mintPrintParams, candyShopProgram });
    }

    return mintPrint(instructions, mintPrintParams);
  }
}

interface NewToken {
  instructions: TransactionInstruction[];
  newEditionMint: Keypair;
  newEditionTokenAccount: PublicKey;
}

async function createNewMintInstructions(payer: PublicKey, connection: Connection): Promise<NewToken> {
  const newMint = web3.Keypair.generate();
  const instructions: TransactionInstruction[] = [];
  const userTokenAccountAddress = (await getAtaForMint(newMint.publicKey, payer))[0];
  instructions.push(
    web3.SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: newMint.publicKey,
      space: MintLayout.span,
      lamports: await connection.getMinimumBalanceForRentExemption(MintLayout.span),
      programId: TOKEN_PROGRAM_ID
    })
  );
  instructions.push(createInitializeMintInstruction(newMint.publicKey, 0, payer, null));
  instructions.push(createAssociatedTokenAccountInstruction(payer, userTokenAccountAddress, payer, newMint.publicKey));
  instructions.push(createMintToInstruction(newMint.publicKey, userTokenAccountAddress, payer, 1));
  return { instructions, newEditionMint: newMint, newEditionTokenAccount: userTokenAccountAddress };
}

async function generateEditionNumber(vaultAccount: PublicKey, connection: Connection): Promise<number> {
  const vaultAccountInfoResult = await safeAwait(connection.getAccountInfo(vaultAccount));
  if (vaultAccountInfoResult.error) {
    throw new CandyShopError(CandyShopErrorType.AuctionDoesNotExist);
  }
  const vaultAccountInfo = vaultAccountInfoResult.result;
  const editionBase10Array = vaultAccountInfo?.data.slice(VAULT_ACCOUNT_SIZE - EDITION_ARRAY_SIZE, VAULT_ACCOUNT_SIZE);
  const vaultMaxSupply = Number(
    vaultAccountInfo?.data.slice(MAX_SUPPLY_OFFSET, MAX_SUPPLY_OFFSET + 8).readBigUint64LE()
  );

  let editionArray: string[] = [];
  for (let i = 0; i < editionBase10Array!.length && i < vaultMaxSupply / 8; i++) {
    const paddingEditionBase2Array = ('00000000' + editionBase10Array![i].toString(2)).slice(-8);
    editionArray = [...editionArray, ...paddingEditionBase2Array];
  }
  editionArray = editionArray.slice(0, vaultMaxSupply);
  editionArray = editionArray.map((v, i) => (v === '1' ? '-1' : String(i + 1))).filter((i) => i !== '-1');
  const edition = new BN(editionArray[Math.floor(Math.random() * editionArray.length)]);
  return edition;
}
