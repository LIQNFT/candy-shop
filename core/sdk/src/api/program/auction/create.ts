import { Transaction } from '@solana/web3.js';
import { getAtaForMint, getAuctionHouseAuthority, sendTx, CreateAuctionParams } from '../..';

export const createAuction = async ({
  seller,
  auction,
  auctionBump,
  candyShop,
  treasuryMint,
  nftMint,
  startingBid,
  startTime,
  biddingPeriod,
  buyNowPrice,
  program
}: CreateAuctionParams) => {
  const [[auctionEscrow], [tokenAccount], [authority]] = await Promise.all([
    getAtaForMint(nftMint, auction),
    getAtaForMint(nftMint, seller.publicKey),
    getAuctionHouseAuthority(seller.publicKey, treasuryMint, program.programId)
  ]);

  const transaction = new Transaction();

  const ix = await program.methods
    .createAuction(startingBid, startTime, biddingPeriod, buyNowPrice)
    .accounts({
      auction,
      auctionEscrow,
      tokenAccount,
      wallet: seller.publicKey,
      nftMint,
      candyShop,
      authority
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
