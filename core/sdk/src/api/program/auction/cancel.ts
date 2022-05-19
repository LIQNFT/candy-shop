import * as anchor from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey, SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import { getAtaForMint, getAuction, getAuctionHouseAuthority, getCandyShop, sendTx } from '../..';

export const cancelAuction = async (
  wallet: AnchorWallet | Keypair,
  treasuryMint: PublicKey,
  nftMint: PublicKey,
  program: anchor.Program
) => {
  const [candyShop] = await getCandyShop(wallet.publicKey, treasuryMint, program.programId);

  const [auction, auctionBump] = await getAuction(candyShop, nftMint, program.programId);

  const [auctionEscrow] = await getAtaForMint(nftMint, auction);

  const [tokenAccount] = await getAtaForMint(nftMint, wallet.publicKey);

  const [authority] = await getAuctionHouseAuthority(wallet.publicKey, treasuryMint, program.programId);

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
  console.log('Auction cancelled');

  return {
    auction,
    auctionBump,
    auctionEscrow,
    usertokenAccount: tokenAccount,
    txId
  };
};
