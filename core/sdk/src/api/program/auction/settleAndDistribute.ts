import * as anchor from '@project-serum/anchor';
import { SYSVAR_CLOCK_PUBKEY, Transaction, PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  AUCTION_HOUSE_PROGRAM_ID,
  checkAHFeeAccountBalance,
  checkSettleParams,
  getAtaForMint,
  getAuctionData,
  getAuctionHouseEscrow,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  getBidData,
  getBidWallet,
  getRemainigAccountsForExecuteSaleIx,
  sendTx,
  SettleAndDistributeProceedParams,
  treasuryMintIsNative
} from '../..';
import { requestExtraComputeIx } from './requestExtraComputeIx';

export const settleAndDistributeProceeds = async ({
  settler,
  metadata,
  auctionHouse,
  treasuryAccount,
  feeAccount,
  candyShop,
  treasuryMint,
  authority,
  auction,
  auctionBump,
  nftMint,
  program,
  env
}: SettleAndDistributeProceedParams) => {
  await checkAHFeeAccountBalance(feeAccount, program.provider.connection);

  const isNative = treasuryMintIsNative(treasuryMint);

  await checkSettleParams(auction, program);
  const auctionData = await getAuctionData(auction, program);
  const bid: PublicKey = auctionData.highestBid.key;
  const bidPrice: anchor.BN = auctionData.highestBid.price;
  const seller: PublicKey = auctionData.seller;
  const bidData = await getBidData(bid, program);
  const buyer: PublicKey = bidData.buyer;

  const [
    [auctionEscrow],
    [bidWallet, bidWalletBump],
    [programAsSigner, programAsSignerBump],
    [buyerReceiptTokenAccount]
  ] = await Promise.all([
    getAtaForMint(nftMint, auction),
    getBidWallet(auction, buyer, program.programId),
    getAuctionHouseProgramAsSigner(),
    getAtaForMint(nftMint, buyer)
  ]);

  const [
    [escrowPaymentAccount, escrowPaymentAccountBump],
    [bidReceiptTokenAccount],
    [auctionTradeState, auctionTradeStateBump],
    [freeAuctionTradeState, freeAuctionTradeStateBump],
    [bidTradeState]
  ] = await Promise.all([
    getAuctionHouseEscrow(auctionHouse, bidWallet),
    getAtaForMint(nftMint, bidWallet),
    getAuctionHouseTradeState(auctionHouse, auction, auctionEscrow, treasuryMint, nftMint, new anchor.BN(1), bidPrice),
    await getAuctionHouseTradeState(
      auctionHouse,
      auction,
      auctionEscrow,
      treasuryMint,
      nftMint,
      new anchor.BN(1),
      new anchor.BN(0)
    ),
    getAuctionHouseTradeState(auctionHouse, bidWallet, auctionEscrow, treasuryMint, nftMint, new anchor.BN(1), bidPrice)
  ]);

  const auctionPaymentReceiptAccount = isNative ? auction : (await getAtaForMint(treasuryMint, auction))[0];
  const sellerPaymentReceiptAccount = isNative ? seller : (await getAtaForMint(treasuryMint, seller))[0];

  const remainingAccounts = await getRemainigAccountsForExecuteSaleIx(
    metadata,
    program.provider.connection,
    treasuryMint,
    isNative
  );

  const transaction = new Transaction();

  const ix1 = await program.methods
    .settleAuction(
      auctionBump,
      bidWalletBump,
      auctionTradeStateBump,
      freeAuctionTradeStateBump,
      escrowPaymentAccountBump,
      programAsSignerBump
    )
    .accounts({
      auction,
      auctionEscrow,
      auctionPaymentReceiptAccount,
      bidReceiptTokenAccount,
      wallet: settler.publicKey,
      bid,
      auctionBidWallet: bidWallet,
      buyer,
      escrowPaymentAccount,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      auctionHouseTreasury: treasuryAccount,
      nftMint,
      treasuryMint,
      metadata,
      candyShop,
      authority,
      bidTradeState,
      auctionTradeState,
      freeAuctionTradeState,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID,
      programAsSigner,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  const ix2 = await program.methods
    .distributeAuctionProceeds(auctionBump, bidWalletBump)
    .accounts({
      auction,
      auctionPaymentReceiptAccount,
      bidReceiptTokenAccount,
      sellerPaymentReceiptAccount,
      buyerReceiptTokenAccount,
      wallet: settler.publicKey,
      bid,
      auctionBidWallet: bidWallet,
      buyer,
      seller,
      nftMint,
      treasuryMint,
      candyShop,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .instruction();

  if (env === 'mainnet-beta') {
    transaction.add(requestExtraComputeIx(400000));
  }

  transaction.add(ix1, ix2);
  const txId = await sendTx(settler, transaction, program);
  console.log('Auction settled with txId ==', txId);

  return {
    sellerPaymentReceiptAccount,
    buyerReceiptTokenAccount,
    auctionPaymentReceiptAccount,
    bidReceiptTokenAccount,
    txId
  };
};
