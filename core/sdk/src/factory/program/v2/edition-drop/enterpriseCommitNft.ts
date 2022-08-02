import { AccountMeta, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CommitNftParams } from '../../model';
import { getAtaForMint, sendTx } from '../../../../vendor';

export const commitNft = async (params: CommitNftParams) => {
  const {
    nftOwner,
    candyShop,
    vaultAccount,
    nftOwnerTokenAccount,
    masterMint,
    masterEditionMetadata,
    masterEdition,
    price,
    startTime,
    salesPeriod,
    whitelistTime,
    program,
    whitelistMint
  } = params;

  const remainingAccounts: AccountMeta[] = [];

  if (whitelistMint) {
    const vaultWlTokenAccount = await getAssociatedTokenAddress(whitelistMint, vaultAccount, true);
    remainingAccounts.push({
      pubkey: whitelistMint,
      isWritable: true,
      isSigner: false
    });

    remainingAccounts.push({
      pubkey: vaultWlTokenAccount,
      isWritable: true,
      isSigner: false
    });
  }

  const [vaultTokenAccount] = await getAtaForMint(masterMint, vaultAccount);

  const transaction = new Transaction();

  const ix = await program.methods
    .enterpriseCommitNft(price, startTime, salesPeriod, whitelistTime ? whitelistTime : null)
    .accounts({
      commitNftCtx: {
        masterEditionTokenAccountAuthority: nftOwner.publicKey,
        masterEditionTokenAccount: nftOwnerTokenAccount,
        vaultAccount,
        vaultTokenAccount,
        masterEditionMetadata: masterEditionMetadata,
        masterEditionAccount: masterEdition,
        masterEditionMint: masterMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
      },
      candyShop
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  transaction.add(ix);

  const txHash = await sendTx(nftOwner, transaction, program);

  console.log('Master edition commited to vault');

  return txHash;
};
