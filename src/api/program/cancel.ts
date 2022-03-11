import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';

export type CancelOrderAccounts = {
  walletKeyPair: Keypair;
  tokenAccount: PublicKey;
  tokenAccountMint: PublicKey;
  authority: PublicKey;
  auctionHouse: PublicKey;
  feeAccount: PublicKey;
  tradeState: PublicKey;
  candyShop: PublicKey;
};

export type CancelOrderData = {
  price: anchor.BN;
  amount: anchor.BN;
  authorityBump: number;
};

export async function cancelOrder(
  accounts: CancelOrderAccounts,
  data: CancelOrderData,
  program: anchor.Program<anchor.Idl>
) {
  const {
    walletKeyPair,
    tokenAccount,
    tokenAccountMint,
    authority,
    auctionHouse,
    feeAccount,
    tradeState,
    candyShop,
  } = accounts;

  const { price, amount, authorityBump } = data;

  const transaction = new Transaction();

  const ix = (program.instruction.cancelWithProxy as (...args: any) => any)(price, amount, authorityBump, {
    accounts: {
      wallet: walletKeyPair.publicKey,
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
  await sendAndConfirmTransaction(program.provider.connection, transaction, [
    walletKeyPair,
  ]);
  console.log('order cancelled');
}
