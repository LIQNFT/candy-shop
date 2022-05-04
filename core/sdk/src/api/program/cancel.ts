import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getAuctionHouseTradeState, checkNftAvailability } from '../utils';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';
import { CancelTransactionParams } from '../model';

export async function cancelOrder(params: CancelTransactionParams) {
  const {
    wallet,
    tokenAccount,
    tokenAccountMint,
    treasuryMint,
    authority,
    authorityBump,
    auctionHouse,
    feeAccount,
    tradeState,
    candyShop,
    price,
    amount,
    program
  } = params;

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

  const txHash = await program.methods
    .cancelWithProxy(price, amount, authorityBump)
    .accounts({
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
    })
    .rpc();

  console.log('sell order cancelled');

  return txHash;
}
