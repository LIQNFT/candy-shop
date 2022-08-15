import { Idl, Program } from '@project-serum/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import {
  checkEditionMintPeriod,
  getAtaForMint,
  getAuctionHouseTreasuryAcct,
  getCandyShopData,
  getEditionMarkAccount,
  getMasterEditionAccount,
  getMetadataAccount,
  sendTx
} from '../../../../vendor';
import { TOKEN_METADATA_PROGRAM_ID } from '../../../constants';
import { MintPrintParams } from '../../model';

/**
 * mintPrint
 * 1. call create new token account
 * 2. call Edition Drop to mint print
 * @param params
 * @returns
 */
export const mintPrint = async (
  newTokenInstruction: TransactionInstruction[],
  params: MintPrintParams & { candyShopProgram: Program<Idl> }
) => {
  const {
    editionBuyer,
    candyShop,
    vaultAccount,
    auctionHouse,
    nftOwnerTokenAccount,
    newEditionMint,
    newEditionTokenAccount,
    masterMint,
    editionNumber,
    program,
    candyShopProgram,
    whitelistMint
  } = params;

  const vaultData = await checkEditionMintPeriod(vaultAccount, program);

  const remainingAccounts: AccountMeta[] = [];
  const candyShopData = await getCandyShopData(candyShop, true, candyShopProgram);

  remainingAccounts.push({
    pubkey: vaultData.nftOwner,
    isSigner: false,
    isWritable: true
  });

  candyShopData.coOwners
    .filter((_: PublicKey, i: number) => candyShopData.splits[i] > 0)
    .forEach((owner: PublicKey) => {
      remainingAccounts.push({
        pubkey: owner,
        isWritable: true,
        isSigner: false
      });
    });

  if (whitelistMint) {
    const [userWlTokenAccount, vaultWlTokenAccount] = await Promise.all([
      getAssociatedTokenAddress(whitelistMint, editionBuyer.publicKey, true),
      getAssociatedTokenAddress(whitelistMint, vaultAccount, true)
    ]);

    remainingAccounts.push({
      pubkey: whitelistMint,
      isWritable: true,
      isSigner: false
    });

    remainingAccounts.push({
      pubkey: userWlTokenAccount,
      isWritable: true,
      isSigner: false
    });

    remainingAccounts.push({
      pubkey: vaultWlTokenAccount,
      isWritable: true,
      isSigner: false
    });
  }

  const [
    [vaultTokenAccount],
    [shopTreasuryAddress],
    [masterEditionMetadata],
    [masterEdition],
    [newEditionMetadata],
    [newEdition],
    [newEditionMark]
  ] = await Promise.all([
    getAtaForMint(masterMint, vaultAccount),
    getAuctionHouseTreasuryAcct(auctionHouse),
    getMetadataAccount(masterMint),
    getMasterEditionAccount(masterMint),
    getMetadataAccount(newEditionMint.publicKey),
    getMasterEditionAccount(newEditionMint.publicKey),
    getEditionMarkAccount(masterMint, editionNumber)
  ]);

  const transaction = new Transaction();
  transaction.add(...newTokenInstruction);

  const ix = await program.methods
    .enterpriseMintPrint(editionNumber)
    .accounts({
      mintPrintCtx: {
        newEditionBuyer: editionBuyer.publicKey,
        vaultAccount,
        vaultTokenAccount,
        masterEditionMetadata,
        masterEditionAccount: masterEdition,
        masterEditionMint: masterMint,
        masterEditionTokenAccount: nftOwnerTokenAccount,
        newEditionMetadata,
        newEditionAccount: newEdition,
        newEditionMarker: newEditionMark,
        newEditionMint: newEditionMint.publicKey,
        newEditionTokenAccount,
        shopTreasuryAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
      },
      candyShop
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  transaction.add(ix);
  return sendTx(editionBuyer, transaction, program, [newEditionMint]);
};
