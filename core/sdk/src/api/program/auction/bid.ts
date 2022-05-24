import * as anchor from '@project-serum/anchor';
import { SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import {
  AUCTION_HOUSE_PROGRAM_ID,
  BidAuctionParams,
  checkBidParams,
  getAtaForMint,
  getAuctionHouseEscrow,
  getAuctionHouseTradeState,
  getBid,
  getBidWallet,
  sendTx,
  treasuryMintIsNative
} from '../..';

export const bidAuction = async ({
  auction,
  authority,
  candyShop,
  buyer,
  treasuryMint,
  nftMint,
  metadata,
  auctionHouse,
  feeAccount,
  bidPrice,
  program
}: BidAuctionParams) => {
  await checkBidParams(auction, bidPrice, program);

  const [bidWallet, bidWalletBump] = await getBidWallet(auction, buyer.publicKey, program.programId);

  const isNative = treasuryMintIsNative(treasuryMint);

  const bidPaymentAccount = isNative ? bidWallet : (await getAtaForMint(treasuryMint, bidWallet))[0];

  const [auctionEscrow] = await getAtaForMint(nftMint, auction);

  const [
    [bid],
    [userTreasuryAta],
    [escrowPaymentAccount, escrowPaymentAccountBump],
    [bidTradeState, bidTradeStateBump]
  ] = await Promise.all([
    getBid(auction, buyer.publicKey, program.programId),
    getAtaForMint(treasuryMint, buyer.publicKey),
    getAuctionHouseEscrow(auctionHouse, bidWallet),
    getAuctionHouseTradeState(auctionHouse, bidWallet, auctionEscrow, treasuryMint, nftMint, new anchor.BN(1), bidPrice)
  ]);

  const transaction = new Transaction();

  const ix = await program.methods
    .makeBid(bidPrice, bidWalletBump, bidTradeStateBump, escrowPaymentAccountBump)
    .accounts({
      wallet: buyer.publicKey,
      auction,
      candyShop,
      bid,
      auctionBidWallet: bidWallet,
      nftMint,
      bidPaymentAccount,
      userTreasuryAta,
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
  console.log('Bid made with txId ==', txId);

  return {
    escrowPaymentAccount,
    bidTradeState,
    bidTradeStateBump,
    txId
  };
};
