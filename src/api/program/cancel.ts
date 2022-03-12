import * as anchor from '@project-serum/anchor';
import { Program, Idl } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
} from '@solana/web3.js';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';

export async function cancelOrder(
  wallet: AnchorWallet,
  tokenAccount: PublicKey,
  tokenAccountMint: PublicKey,
  authority: PublicKey,
  authorityBump: number,
  auctionHouse: PublicKey,
  feeAccount: PublicKey,
  tradeState: PublicKey,
  candyShop: PublicKey,
  price: anchor.BN,
  amount: anchor.BN,
  program: Program<Idl>
) {
  const transaction = new Transaction();

  const ix = await (program.instruction.cancelWithProxy as (
    ...args: any
  ) => any)(price, amount, authorityBump, {
    accounts: {
      wallet: wallet.publicKey,
      tokenAccount,
      tokenMint: tokenAccountMint,
      authority,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      tradeState,
      candyShop,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });

  transaction.add(ix);
  const signedTx = await wallet.signTransaction(transaction);

  const txHash = await sendAndConfirmRawTransaction(
    program.provider.connection,
    signedTx.serialize()
  );

  console.log('sell order cancelled');

  return txHash;
}
