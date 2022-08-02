import { AccountMeta, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { MintPrintParams } from '../../model';
import {
  getAtaForMint,
  getAuctionHouseTreasuryAcct,
  getMetadataAccount,
  getMasterEditionAccount,
  getEditionMarkAccount,
  sendTx
} from '../../../../vendor';
import { TOKEN_METADATA_PROGRAM_ID } from '../../../constants';

export const mintPrint = async (newTokenInstruction: TransactionInstruction[], params: MintPrintParams) => {
  const {
    editionBuyer,
    candyShop,
    vaultAccount,
    auctionHouse,
    nftOwnerTokenAccount,
    masterMint,
    newEditionTokenAccount,
    newEditionMint,
    editionNumber,
    program,
    whitelistMint
  } = params;

  const remainingAccounts: AccountMeta[] = [];

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
    getEditionMarkAccount(newEditionMint.publicKey, editionNumber)
  ]);

  const transaction = new Transaction();

  transaction.add(...newTokenInstruction);

  const ix = await program.methods
    .shopMintPrint(editionNumber)
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

  return await sendTx(editionBuyer, transaction, program);
};
