import { AccountMeta, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { MintPrintParams } from '../../model';
import { getAtaForMint, getAuctionHouseTreasuryAcct, sendTx } from '../../../../vendor';
import { TOKEN_METADATA_PROGRAM_ID } from '../../../constants';
import { Idl, Program } from '@project-serum/anchor';

export const mintPrint = async (params: MintPrintParams & { candyShopProgram: Program<Idl> }) => {
  const {
    editionBuyer,
    candyShop,
    vaultAccount,
    auctionHouse,
    nftOwnerTokenAccount,
    masterMint,
    masterEditionMetadata,
    masterEdition,
    newEidtionNftOwnerTokenAccount,
    newEditionMint,
    newEditionMetadata,
    newEdition,
    newEditionMark,
    editionNumber,
    program,
    candyShopProgram,
    whitelistMint
  } = params;

  const vaultData = await program.account.vaultAccount.fetch(vaultAccount);

  const remainingAccounts: AccountMeta[] = [];
  const candyShopData = await candyShopProgram.account.enterpriseCandyShopV1.fetch(candyShop);

  remainingAccounts.push({
    pubkey: vaultData.nftOwner,
    isSigner: false,
    isWritable: false
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

  const [[vaultTokenAccount], [shopTreasuryAddress]] = await Promise.all([
    getAtaForMint(masterMint, vaultAccount),
    getAuctionHouseTreasuryAcct(auctionHouse)
  ]);

  const transaction = new Transaction();

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
        newEditionMint: newEditionMint,
        newEditionTokenAccount: newEidtionNftOwnerTokenAccount,
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

  const txHash = await sendTx(editionBuyer, transaction, program);

  console.log('Edition printed');

  return txHash;
};
