import { Transaction } from '@solana/web3.js';
import { checkSaleOngoing, sendTx } from '../../../../../vendor';
import { UpdateEditionVaultParams } from '../../types';

export const updateEditionVault = async (params: UpdateEditionVaultParams) => {
  const { nftOwner, vaultAccount, newPrice, program } = params;

  await checkSaleOngoing(vaultAccount, program);

  const transaction = new Transaction();

  const ix = await program.methods
    .updateVault(newPrice)
    .accounts({
      nftOwner: nftOwner.publicKey,
      vaultAccount
    })
    .instruction();

  transaction.add(ix);

  return sendTx(nftOwner, transaction, program);
};
