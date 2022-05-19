// TODO
import * as anchor from '@project-serum/anchor';
import { Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import { getAtaForMint, getAuction, getAuctionHouseAuthority, getCandyShop } from '../..';

export const createAuction = async (
  csCreatorKeypair: Keypair,
  treasuryMint: PublicKey,
  nftMint: PublicKey,
  startingBid: anchor.BN,
  startTime: anchor.BN,
  biddingPerid: anchor.BN,
  buyNowPrice: anchor.BN | null,
  program: anchor.Program
) => {
  const [candyShop] = await getCandyShop(csCreatorKeypair.publicKey, treasuryMint, program.programId);

  const [auction, auctionBump] = await getAuction(candyShop, nftMint, program.programId);

  const [auctionEscrow] = await getAtaForMint(nftMint, auction);

  const [tokenAccount] = await getAtaForMint(nftMint, csCreatorKeypair.publicKey);

  const [authority] = await getAuctionHouseAuthority(csCreatorKeypair.publicKey, treasuryMint, program.programId);

  const transaction = new Transaction();

  const ix = await program.methods
    .createAuction(startingBid, startTime, biddingPerid, buyNowPrice)
    .accounts({
      auction,
      auctionEscrow,
      tokenAccount,
      wallet: csCreatorKeypair.publicKey,
      nftMint,
      candyShop,
      authority
    })
    .instruction();

  transaction.add(ix);
  const txId = await sendAndConfirmTransaction(program.provider.connection, transaction, [csCreatorKeypair]);
  console.log('Auction created');

  return {
    auction,
    auctionBump,
    auctionEscrow,
    txId
  };
};
