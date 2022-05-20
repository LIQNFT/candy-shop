import { Transaction } from '@solana/web3.js';
import { getAtaForMint, getAuction, getAuctionHouseAuthority, getCandyShop, sendTx } from '../..';
import { CreateAuctionParams } from '../../model';

export const createAuction = async ({
  wallet,
  treasuryMint,
  nftMint,
  startingBid,
  startTime,
  biddingPeriod,
  buyNowPrice,
  program
}: CreateAuctionParams) => {
  const [candyShop] = await getCandyShop(wallet.publicKey, treasuryMint, program.programId);

  const [auction, auctionBump] = await getAuction(candyShop, nftMint, program.programId);

  const [[auctionEscrow], [tokenAccount], [authority]] = await Promise.all([
    getAtaForMint(nftMint, auction),
    getAtaForMint(nftMint, wallet.publicKey),
    getAuctionHouseAuthority(wallet.publicKey, treasuryMint, program.programId)
  ]);

  const transaction = new Transaction();

  const ix = await program.methods
    .createAuction(startingBid, startTime, biddingPeriod, buyNowPrice)
    .accounts({
      auction,
      auctionEscrow,
      tokenAccount,
      wallet: wallet.publicKey,
      nftMint,
      candyShop,
      authority
    })
    .instruction();

  transaction.add(ix);
  const txId = await sendTx(wallet, transaction, program);
  console.log('Auction created with txId ==', txId);

  return {
    auction,
    auctionBump,
    auctionEscrow,
    txId
  };
};
