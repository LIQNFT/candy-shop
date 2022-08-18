import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { checkRedeemable, getAtaForMint, sendTx } from '../../../../vendor';
import { RedeemNftParams } from '../../model';

export const redeemNft = async (params: RedeemNftParams) => {
  const { nftOwner, vaultAccount, nftOwnerTokenAccount, masterMint, program } = params;

  await checkRedeemable(vaultAccount, program);

  const transaction = new Transaction();

  const [vaultTokenAccount] = await getAtaForMint(masterMint, vaultAccount);

  const ix = await program.methods
    .redeemNft()
    .accounts({
      nftOwner: nftOwner.publicKey,
      nftOwnerTokenAccount,
      vaultAccount,
      vaultTokenAccount,
      nftMint: masterMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY
    })
    .instruction();

  transaction.add(ix);

  return await sendTx(nftOwner, transaction, program);
};
