import * as anchor from '@project-serum/anchor';
import { Idl, Program } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
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
  const txHash = await program.rpc.cancelWithProxy(
    price,
    amount,
    authorityBump,
    {
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
    }
  );

  console.log('sell order cancelled');

  return txHash;
}
