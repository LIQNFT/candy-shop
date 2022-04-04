import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { awaitTransactionSignatureConfirmation } from './submitTx';
export async function transferSol(
  wallet: AnchorWallet,
  connection: Connection,
  toAccount: PublicKey,
  // in lamport
  amount: number
) {
  const transaction = new Transaction();
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: toAccount,
      lamports: amount,
    })
  );
  // add recent blockhash
  const recentBlockhash = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = recentBlockhash.blockhash;
  // add fee payer
  transaction.feePayer = wallet.publicKey;

  const signedTx = await wallet.signTransaction(transaction);
  const txHash = await awaitTransactionSignatureConfirmation(
    connection,
    signedTx.serialize()
  );
  return txHash;
}
