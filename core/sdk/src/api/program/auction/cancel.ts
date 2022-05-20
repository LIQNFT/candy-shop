import { SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import { getAtaForMint, getAuction, getAuctionHouseAuthority, getCandyShop, sendTx } from '../..';
import { CancelAuctionParams } from '../../model';

export const cancelAuction = async ({ wallet, treasuryMint, nftMint, program }: CancelAuctionParams) => {
  const [candyShop] = await getCandyShop(wallet.publicKey, treasuryMint, program.programId);

  const [auction, auctionBump] = await getAuction(candyShop, nftMint, program.programId);

  const [[auctionEscrow], [tokenAccount], [authority]] = await Promise.all([
    getAtaForMint(nftMint, auction),
    getAtaForMint(nftMint, wallet.publicKey),
    getAuctionHouseAuthority(wallet.publicKey, treasuryMint, program.programId)
  ]);

  const transaction = new Transaction();

  const ix = await program.methods
    .cancelAuction(auctionBump)
    .accounts({
      auction,
      auctionEscrow,
      tokenAccount,
      wallet: wallet.publicKey,
      nftMint,
      candyShop,
      authority,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .instruction();

  transaction.add(ix);
  const txId = await sendTx(wallet, transaction, program);
  console.log('Auction cancelled with txId ==', txId);

  return {
    auction,
    auctionBump,
    auctionEscrow,
    usertokenAccount: tokenAccount,
    txId
  };
};
