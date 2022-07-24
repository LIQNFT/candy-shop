import { Transaction, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import {
  getAtaForMint,
  getAuctionHouseAuthority,
  sendTx,
  checkCreators,
  checkNftBasisPoints,
  checkCreationParams,
  TransactionType,
  getMetadataAccount
} from '../../../../vendor';
import { CreateAuctionParams } from '../../model';

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
  await checkCreators(treasuryMint, nftMint, program.provider.connection, TransactionType.Auction);

  const [[auctionEscrow], [tokenAccount], [authority], [metadata]] = await Promise.all([
    getAtaForMint(nftMint, auction),
    getAtaForMint(nftMint, seller.publicKey),
    getAuctionHouseAuthority(seller.publicKey, treasuryMint, program.programId),
    getMetadataAccount(nftMint)
  ]);

  await checkNftBasisPoints(metadata, program.provider.connection);

  const transaction = new Transaction();

  const ix = await program.methods
    .createAuction(startingBid, startTime, biddingPeriod, tickSize, buyNowPrice)
    .accounts({
      auction,
      auctionEscrow,
      tokenAccount,
      wallet: seller.publicKey,
      nftMint,
      metadata,
      candyShop,
      authority,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .instruction();

  transaction.add(ix);
  const txId = await sendTx(seller, transaction, program);
  console.log('Auction created with txId ==', txId);

  return txId;
};
