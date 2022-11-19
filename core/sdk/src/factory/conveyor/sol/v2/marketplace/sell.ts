import * as anchor from '@project-serum/anchor';
import { createRevokeInstruction, getAccount } from '@solana/spl-token';
import {
  AUCTION_HOUSE_PROGRAM_ID,
  getAtaForMint,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  sendTx,
  treasuryMintIsNative,
  safeAwait,
  checkCreators,
  TransactionType
} from '../../../../../vendor';
import { SellTransactionParams } from '../../types/shop.type';

export async function sellNft(params: SellTransactionParams): Promise<string> {
  const {
    wallet,
    tokenAccount,
    tokenAccountMint,
    treasuryMint,
    metadata,
    authority,
    auctionHouse,
    feeAccount,
    candyShop,
    price,
    amount,
    program
  } = params;

  await checkCreators(treasuryMint, tokenAccountMint, program.provider.connection, TransactionType.Marketplace);

  const [tradeState, tradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    wallet.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    price
  );

  const [freeTradeState, freeTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    wallet.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    new anchor.BN(0)
  );

  // TODO: re-enable it when the indexer is back on track. For now disable it to allow users to sell same NFT > 1 time
  // await checkTradeStateExist(program.provider.connection, tradeState, tradeStateBump);

  const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner();

  const transaction = new anchor.web3.Transaction();

  const isNative = treasuryMintIsNative(treasuryMint);

  if (!isNative) {
    const sellerPaymentReceiptAccount = (await getAtaForMint(treasuryMint, wallet.publicKey))[0];
    const sellerPaymentReceiptAccountInfo = (
      await safeAwait(getAccount(program.provider.connection, sellerPaymentReceiptAccount))
    ).result;

    if (sellerPaymentReceiptAccountInfo && sellerPaymentReceiptAccountInfo.delegate) {
      transaction.add(createRevokeInstruction(sellerPaymentReceiptAccount, wallet.publicKey));
    }
  }

  const ix = await program.methods
    .sellWithProxy(price, amount, tradeStateBump, freeTradeStateBump, programAsSignerBump)
    .accounts({
      wallet: wallet.publicKey,
      tokenAccount,
      metadata,
      authority,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      sellerTradeState: tradeState,
      freeSellerTradeState: freeTradeState,
      candyShop,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID,
      programAsSigner
    })
    .instruction();

  transaction.add(ix);

  const txHash = await sendTx(wallet, transaction, program);

  console.log('sell order placed');

  return txHash;
}
