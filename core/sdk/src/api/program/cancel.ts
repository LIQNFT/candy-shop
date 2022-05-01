import * as anchor from '@project-serum/anchor';
import { Idl, Program, web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { getAuctionHouseTradeState, checkNftAvailability } from '../utils';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';

export async function cancelOrder(
  wallet: AnchorWallet | web3.Keypair,
  tokenAccount: web3.PublicKey,
  tokenAccountMint: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  authority: web3.PublicKey,
  authorityBump: number,
  auctionHouse: web3.PublicKey,
  feeAccount: web3.PublicKey,
  tradeState: web3.PublicKey,
  candyShop: web3.PublicKey,
  price: anchor.BN,
  amount: anchor.BN,
  program: Program<Idl>
) {
  const [sellTradeState, sellTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    wallet.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    price
  );
  await checkNftAvailability(
    program.provider.connection,
    tokenAccount,
    sellTradeState,
    sellTradeStateBump,
    amount.toNumber()
  );

  const txHash = await program.rpc.cancelWithProxy(price, amount, authorityBump, {
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
      tokenProgram: TOKEN_PROGRAM_ID
    }
  });

  console.log('sell order cancelled');

  return txHash;
}
