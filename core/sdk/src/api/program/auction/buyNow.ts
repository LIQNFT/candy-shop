import * as anchor from '@project-serum/anchor';
import { SYSVAR_CLOCK_PUBKEY, Transaction, PublicKey } from '@solana/web3.js';
import {
  AUCTION_HOUSE_PROGRAM_ID,
  BuyNowAuctionParams,
  checkAHFeeAccountBalance,
  checkBidPeriod,
  checkBuyNowAvailable,
  getAtaForMint,
  getAuctionData,
  getAuctionHouseEscrow,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  getRemainigAccountsForExecuteSaleIx,
  sendTx,
  treasuryMintIsNative
} from '../..';
import { checkIfBidExists, getBid } from '../../utils';
import { requestExtraComputeIx } from './requestExtraComputeIx';
import { withdrawBid } from './withdraw';

export const buyNowAuction = async ({
  candyShop,
  auction,
  auctionBump,
  authority,
  buyer,
  treasuryMint,
  nftMint,
  metadata,
  auctionHouse,
  feeAccount,
  treasuryAccount,
  program,
  env
}: BuyNowAuctionParams) => {
  await checkAHFeeAccountBalance(feeAccount, program.provider.connection);

  const isNative = treasuryMintIsNative(treasuryMint);

  const auctionData = await getAuctionData(auction, program);
  await checkBidPeriod(auction, program);
  const buyNowPrice = await checkBuyNowAvailable(auction, program);

  const seller: PublicKey = auctionData.seller;

  const [auctionEscrow] = await getAtaForMint(nftMint, auction);
  const [buyerReceiptTokenAccount] = await getAtaForMint(nftMint, buyer.publicKey);

  const sellerPaymentReceiptAccount = isNative ? seller : (await getAtaForMint(treasuryMint, seller))[0];

  const paymentAccount = isNative ? buyer.publicKey : (await getAtaForMint(treasuryMint, buyer.publicKey))[0];

  const auctionPaymentReceiptAccount = isNative ? auction : (await getAtaForMint(treasuryMint, auction))[0];

  const [escrowPaymentAccount, escrowPaymentAccountBump] = await getAuctionHouseEscrow(auctionHouse, buyer.publicKey);

  const [auctionTradeState, auctionTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    auction,
    auctionEscrow,
    treasuryMint,
    nftMint,
    new anchor.BN(1),
    buyNowPrice
  );

  const [freeAuctionTradeState, freeAuctionTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    auction,
    auctionEscrow,
    treasuryMint,
    nftMint,
    new anchor.BN(1),
    new anchor.BN(0)
  );

  const [buyerTradeState, buyerTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    buyer.publicKey,
    auctionEscrow,
    treasuryMint,
    nftMint,
    new anchor.BN(1),
    buyNowPrice
  );

  const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner();

  const remainingAccounts = await getRemainigAccountsForExecuteSaleIx(
    metadata,
    program.provider.connection,
    treasuryMint,
    isNative
  );

  const [bid] = await getBid(auction, buyer.publicKey, program.programId);

  const transaction = new Transaction();

  const ix = await program.methods
    .buyNow(
      auctionBump,
      auctionTradeStateBump,
      buyerTradeStateBump,
      escrowPaymentAccountBump,
      freeAuctionTradeStateBump,
      programAsSignerBump
    )
    .accounts({
      wallet: buyer.publicKey,
      seller,
      sellerPaymentReceiptAccount,
      auction,
      candyShop,
      paymentAccount,
      transferAuthority: buyer.publicKey,
      nftMint,
      treasuryMint,
      auctionEscrow,
      metadata,
      escrowPaymentAccount,
      auctionPaymentReceiptAccount,
      buyerReceiptTokenAccount,
      authority,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      auctionHouseTreasury: treasuryAccount,
      buyerTradeState,
      auctionTradeState,
      freeAuctionTradeState,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID,
      programAsSigner,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  if (env === 'mainnet-beta') {
    transaction.add(requestExtraComputeIx(400000));
  }

  transaction.add(ix);
  const txId = await sendTx(buyer, transaction, program);
  console.log('Buy Now called with txId ==', txId);

  if (await checkIfBidExists(bid, program.provider.connection)) {
    console.log("withdrawing user's bid after buy now");
    await withdrawBid({
      auction,
      authority,
      candyShop,
      buyer,
      treasuryMint,
      nftMint,
      metadata,
      auctionHouse,
      feeAccount,
      program
    });
  }

  return {
    buyerReceiptTokenAccount,
    sellerPaymentReceiptAccount,
    txId
  };
};
