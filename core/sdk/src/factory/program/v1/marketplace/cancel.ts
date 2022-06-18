import * as anchor from '@project-serum/anchor';
import { AUCTION_HOUSE_PROGRAM_ID, getAuctionHouseTradeState, sendTx } from '../../../../vendor';
import { checkNftAvailability } from '../../../../vendor/utils/validationUtils';
import { CancelTransactionParams } from '../../model';

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

  const transaction = new anchor.web3.Transaction();

  const ix = await program.methods
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
      ahProgram: AUCTION_HOUSE_PROGRAM_ID
    })
    .instruction();

  transaction.add(ix);

  const txHash = await sendTx(wallet, transaction, program);

  console.log('sell order cancelled');

  return txHash;
}
