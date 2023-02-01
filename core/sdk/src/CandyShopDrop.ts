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
import {
  EditionDropCommitNftParams,
  EditionDropMintPrintParams,
  EditionDropRedeemParams,
  EditionDropUpdateParams,
  RegisterDropParams,
  RegisterRedemptionParams
} from './shop/sol/CandyShopModel';
import { EDITION_DROP_PROGRAM_ID } from './factory/constants';
import {
  commitNft,
  CommitNftParams,
  enterpriseCommitNft,
  enterpriseMintPrint,
  mintPrint,
  MintPrintParams,
  MintPrintWithInfoParams,
  redeemNft,
  RedeemNftParams,
  updateEditionVault,
  UpdateEditionVaultParams
} from './factory/conveyor/sol';
import editionDropIdl from './idl/edition_drop.json';
import {
  CandyShopError,
  CandyShopErrorType,
  getAtaForMint,
  getEditionVaultAccount,
  getMintReceipt,
  getNodeWallet,
  safeAwait
} from './vendor';
import { mintPrintWithInfo } from './factory/conveyor/sol/v2/editionDrop/mintPrintWithInfo';
import { RedemptionType } from '@liqnft/candy-shop-types';
import { registerDropRedemption, registerDropWithRedemption } from './CandyShopDropAPI';

const EDITION_ARRAY_SIZE = 1250;

// ignore the reserved size here
const VAULT_ACCOUNT_SIZE = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 1 + 32 + EDITION_ARRAY_SIZE;

const MAX_SUPPLY_OFFSET = 8 + 32 + 32 + 8;

const Logger = 'CandyShopSDK/CandyShopDrop';

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
      hasRedemption,
      whitelistTime,
      candyShopProgram,
      shopId,
      inputSchema,
      description
    } = params;

    checkTimeValidity(startTime, whitelistTime);

    const [vaultAccount] = await getEditionVaultAccount(candyShop, nftOwnerTokenAccount);

    if (hasRedemption && inputSchema) {
      const payload: RegisterDropParams = {
        shopId,
        vaultAddress: vaultAccount.toString(),
        redemptionType: RedemptionType.Ticket,
        userInputsSchema: inputSchema,
        description
      };
      await registerDropWithRedemption(payload);
    }

    const commitNftParams: CommitNftParams = {
      candyShop,
      vaultAccount,
      nftOwner,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      hasRedemption,
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
      candyShopProgram,
      treasuryMint,
      mintEditionNumber,
      instructions,
      newEditionMint,
      newEditionTokenAccount,
      info
    } = params;

    const [vaultAccount] = await getEditionVaultAccount(candyShop, nftOwnerTokenAccount);

    const editionNumber = mintEditionNumber ? mintEditionNumber : await generateEditionNumber(vaultAccount, connection);
    console.log('editionNumber ', editionNumber.toString());

    const program = this.getProgram(connection, editionBuyer);

    if (info) {
      if (isEnterprise) throw new CandyShopError(CandyShopErrorType.NotReachable);
      const [mintReceipt] = await getMintReceipt(vaultAccount, newEditionMint.publicKey);

      const payload: RegisterRedemptionParams = {
        vaultAddress: vaultAccount.toString(),
        editionMint: newEditionMint.publicKey.toString(),
        walletAddress: editionBuyer.publicKey.toString(),
        userInputs: info,
        redemptionType: RedemptionType.Ticket
      };

      await registerDropRedemption(payload);

      const mintPrintWithInfoParams: MintPrintWithInfoParams = {
        candyShop,
        vaultAccount,
        nftOwnerTokenAccount,
        masterMint,
        whitelistMint,
        editionBuyer,
        auctionHouse,
        editionNumber: new BN(editionNumber),
        newEditionMint,
        newEditionTokenAccount,
        mintReceipt,
        program,
        treasuryMint,
        info
      };
      return mintPrintWithInfo(instructions, mintPrintWithInfoParams);
    }

    const mintPrintParams: MintPrintParams = {
      candyShop,
      vaultAccount,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      editionBuyer,
      auctionHouse,
      editionNumber: new BN(editionNumber),
      newEditionMint,
      newEditionTokenAccount,
      program,
      treasuryMint
    };

    if (isEnterprise) {
      return enterpriseMintPrint(instructions, { ...mintPrintParams, candyShopProgram });
    }

    return mintPrint(instructions, mintPrintParams);
  }

  static async redeemDrop(params: EditionDropRedeemParams): Promise<string> {
    const { nftOwner, candyShop, nftOwnerTokenAccount, masterMint, connection } = params;
    const [vaultAccount] = await getEditionVaultAccount(candyShop, nftOwnerTokenAccount);
    const program = this.getProgram(connection, nftOwner);

    const redeemParams: RedeemNftParams = {
      nftOwner,
      candyShop,
      vaultAccount,
      nftOwnerTokenAccount,
      masterMint,
      program
    };

    return redeemNft(redeemParams);
  }

  static async updateEditionVault(params: EditionDropUpdateParams): Promise<string> {
    const { nftOwner, newPrice, candyShop, nftOwnerTokenAccount, masterMint, connection } = params;
    const [vaultAccount] = await getEditionVaultAccount(candyShop, nftOwnerTokenAccount);
    const program = this.getProgram(connection, nftOwner);

    const updateParams: UpdateEditionVaultParams = {
      nftOwner,
      candyShop,
      vaultAccount,
      nftOwnerTokenAccount,
      newPrice,
      masterMint,
      program
    };

    return updateEditionVault(updateParams);
  }
}

interface NewToken {
  instructions: TransactionInstruction[];
  newEditionMint: Keypair;
  newEditionTokenAccount: PublicKey;
}

export async function createNewMintInstructions(payer: PublicKey, connection: Connection): Promise<NewToken> {
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
  instructions.push(createInitializeMintInstruction(newMint.publicKey, 0, payer, payer));
  instructions.push(createAssociatedTokenAccountInstruction(payer, userTokenAccountAddress, payer, newMint.publicKey));
  instructions.push(createMintToInstruction(newMint.publicKey, userTokenAccountAddress, payer, 1));
  return { instructions, newEditionMint: newMint, newEditionTokenAccount: userTokenAccountAddress };
}

export async function getAvailableEditionNumbers(vaultAccount: PublicKey, connection: Connection): Promise<string[]> {
  const vaultAccountInfoResult = await safeAwait(connection.getAccountInfo(vaultAccount));
  if (vaultAccountInfoResult.error) {
    throw new CandyShopError(CandyShopErrorType.AuctionDoesNotExist);
  }
  const vaultAccountInfo = vaultAccountInfoResult.result;
  const editionBase10Array = vaultAccountInfo?.data.slice(VAULT_ACCOUNT_SIZE - EDITION_ARRAY_SIZE, VAULT_ACCOUNT_SIZE);
  const maxSupplyData = vaultAccountInfo?.data.slice(MAX_SUPPLY_OFFSET, MAX_SUPPLY_OFFSET + 8);

  if (!maxSupplyData || !editionBase10Array) {
    console.log(`${Logger}: maxSupplyData ${maxSupplyData} or editionBase10Array ${editionBase10Array} is invalid`);
    throw new CandyShopError(CandyShopErrorType.NotReachable);
  }
  const maxSupplyDataArray = new Uint8Array(maxSupplyData);
  const view = new DataView(maxSupplyDataArray.buffer, 0);
  const vaultMaxSupply = Number(view.getBigInt64(0, true));

  let editionArray: string[] = [];
  for (let i = 0; i < editionBase10Array.length && i < vaultMaxSupply / 8; i++) {
    const paddingEditionBase2Array = ('00000000' + editionBase10Array[i].toString(2)).slice(-8);
    editionArray = [...editionArray, ...paddingEditionBase2Array];
  }
  editionArray = editionArray.slice(0, vaultMaxSupply);
  editionArray = editionArray.map((v, i) => (v === '1' ? '-1' : String(i + 1))).filter((i) => i !== '-1');
  return editionArray;
}

async function generateEditionNumber(vaultAccount: PublicKey, connection: Connection): Promise<number> {
  const editionArray: Array<string> = await getAvailableEditionNumbers(vaultAccount, connection);
  const edition = Number(editionArray[Math.floor(Math.random() * editionArray.length)]);
  return edition;
}

function checkTimeValidity(startTime: BN, whitelistTime?: BN) {
  const now = new BN(new Date().getTime() / 1000);
  if (whitelistTime) {
    if (whitelistTime.gte(startTime) || whitelistTime.lt(now)) {
      throw new CandyShopError(CandyShopErrorType.InvalidDropWhitelistTime);
    }
  }
  if (startTime.lt(now)) {
    throw new CandyShopError(CandyShopErrorType.InvalidDropStartTime);
  }
}
