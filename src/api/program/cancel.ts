import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair, PublicKey,
  sendAndConfirmTransaction, Transaction
} from "@solana/web3.js";
import { AUCTION_HOUSE_PROGRAM_ID } from "../constants";


export async function cancelOrder(
  walletKeyPair: Keypair,
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
  program: anchor.Program
) {

  const transaction = new Transaction();


  const ix = await program.instruction.cancelWithProxy(
    price,
    amount,
    authorityBump,
    {
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
    }
  );

  transaction.add(ix);
  const txId = await sendAndConfirmTransaction(
    program.provider.connection,
    transaction,
    [walletKeyPair]
  );
  console.log("order cancelled")
}
