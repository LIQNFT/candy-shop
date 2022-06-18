import { SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import { getAtaForMint, getAuctionHouseAuthority, sendTx, checkCanCancel } from '../../../../vendor';
import { CancelAuctionParams } from '../../model';

export const cancelAuction = async (params: CancelAuctionParams) => {
  const { seller, auction, candyShop, auctionBump, treasuryMint, nftMint, program } = params;

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

  return txId;
};
