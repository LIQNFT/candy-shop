import * as anchor from '@project-serum/anchor';
import { SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import {
  AUCTION_HOUSE_PROGRAM_ID,
  getAtaForMint,
  getAuctionHouseEscrow,
  getAuctionHouseTradeState,
  getBid,
  getBidWallet,
  sendTx,
  treasuryMintIsNative,
  checkAHFeeAccountBalance,
  checkCanWithdraw
} from '../../../../../vendor';
import { WithdrawBidParams } from '../../types/shop.type';

export const withdrawBid = async ({
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
}: WithdrawBidParams) => {
  await checkAHFeeAccountBalance(feeAccount, program.provider.connection);

  const [bidWallet, bidWalletBump] = await getBidWallet(auction, buyer.publicKey, program.programId);

  const isNative = treasuryMintIsNative(treasuryMint);

  const [auctionEscrow] = await getAtaForMint(nftMint, auction);

  const [bid] = await getBid(auction, buyer.publicKey, program.programId);

  await checkCanWithdraw(auction, bid, program);

  const bidAccount = await program.account.bid.fetch(bid);

  console.log('bidAccount');
  console.log(bidAccount);

  const [[userTreasuryAta], [escrowPaymentAccount, escrowPaymentAccountBump], [bidTradeState]] = await Promise.all([
    getAtaForMint(treasuryMint, buyer.publicKey),
    getAuctionHouseEscrow(auctionHouse, bidWallet),
    getAuctionHouseTradeState(
      auctionHouse,
      bidWallet,
      auctionEscrow,
      treasuryMint,
      nftMint,
      new anchor.BN(1),
      bidAccount.price
    )
  ]);

  const bidReceiptAccount = isNative ? bidWallet : (await getAtaForMint(treasuryMint, bidWallet))[0];

  const transaction = new Transaction();

  const ix = await program.methods
    .withdrawBid(bidWalletBump, escrowPaymentAccountBump)
    .accounts({
      wallet: buyer.publicKey,
      auction,
      candyShop,
      bid,
      auctionBidWallet: bidWallet,
      userTreasuryAta,
      bidReceiptAccount,
      nftMint,
      treasuryMint,
      auctionEscrow,
      metadata,
      escrowPaymentAccount,
      authority,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      bidTradeState,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .instruction();

  transaction.add(ix);
  const txId = await sendTx(buyer, transaction, program);
  console.log('Bid withdrawn with txId ==', txId);

  return txId;
};
