import { SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import { CancelAuctionParams, checkCanCancel, getAtaForMint, getAuctionHouseAuthority, sendTx } from '../..';

export const cancelAuction = async ({
  seller,
  auction,
  candyShop,
  auctionBump,
  treasuryMint,
  nftMint,
  program
}: CancelAuctionParams) => {
  await checkCanCancel(auction, program);

  const [[auctionEscrow], [tokenAccount], [authority]] = await Promise.all([
    getAtaForMint(nftMint, auction),
    getAtaForMint(nftMint, seller.publicKey),
    getAuctionHouseAuthority(seller.publicKey, treasuryMint, program.programId)
  ]);

  const transaction = new Transaction();

  const ix = await program.methods
    .cancelAuction(auctionBump)
    .accounts({
      auction,
      auctionEscrow,
      wallet: seller.publicKey,
      tokenAccount,
      nftMint,
      authority,
      candyShop,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .instruction();

  transaction.add(ix);
  const txId = await sendTx(seller, transaction, program);
  console.log('Auction cancelled with txId ==', txId);

  return {
    auction,
    auctionBump,
    auctionEscrow,
    usertokenAccount: tokenAccount,
    txId
  };
};
