import { Transaction, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import {
  getAtaForMint,
  getAuctionHouseAuthority,
  sendTx,
  CreateAuctionParams,
  checkCreationParams,
  checkCanExecSettle
} from '../..';

export const createAuction = async (params: CreateAuctionParams) => {
  const {
    seller,
    auction,
    auctionBump,
    candyShop,
    treasuryMint,
    nftMint,
    startingBid,
    startTime,
    biddingPeriod,
    tickSize,
    buyNowPrice,
    program
  } = params;

  checkCreationParams(startTime, startingBid, buyNowPrice, tickSize);
  await checkCanExecSettle(treasuryMint, nftMint, program.provider.connection);

  const [[auctionEscrow], [tokenAccount], [authority]] = await Promise.all([
    getAtaForMint(nftMint, auction),
    getAtaForMint(nftMint, seller.publicKey),
    getAuctionHouseAuthority(seller.publicKey, treasuryMint, program.programId)
  ]);

  const transaction = new Transaction();

  const ix = await program.methods
    .createAuction(startingBid, startTime, biddingPeriod, tickSize, buyNowPrice)
    .accounts({
      auction,
      auctionEscrow,
      tokenAccount,
      wallet: seller.publicKey,
      nftMint,
      candyShop,
      authority,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .instruction();

  transaction.add(ix);
  const txId = await sendTx(seller, transaction, program);
  console.log('Auction created with txId ==', txId);

  return {
    auction,
    auctionBump,
    auctionEscrow,
    txId
  };
};
