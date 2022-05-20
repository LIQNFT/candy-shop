import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import {
  getAtaForMint,
  getAuction,
  getAuctionHouseAuthority,
  getAuctionHouseEscrow,
  getAuctionHouseTradeState,
  getBid,
  getBidWallet,
  getCandyShop,
  sendTx,
  treasuryMintIsNative
} from '../..';
import { AUCTION_HOUSE_PROGRAM_ID } from '../../constants';
import { BidAuctionParams } from '../../model';

export const bidAuction = async ({
  wallet,
  buyer,
  treasuryMint,
  nftMint,
  metadata,
  auctionHouse,
  feeAccount,
  bidPrice,
  program
}: BidAuctionParams) => {
  const [candyShop] = await getCandyShop(wallet.publicKey, treasuryMint, program.programId);

  const [auction] = await getAuction(candyShop, nftMint, program.programId);

  const [bidWallet, bidWalletBump] = await getBidWallet(auction, buyer.publicKey, program.programId);

  const isNative = treasuryMintIsNative(treasuryMint);

  const bidPaymentAccount = isNative ? bidWallet : (await getAtaForMint(treasuryMint, bidWallet))[0];

  const [auctionEscrow] = await getAtaForMint(nftMint, auction);

  const [
    [authority],
    [bid],
    [userTreasuryAta],
    [escrowPaymentAccount, escrowPaymentAccountBump],
    [bidTradeState, bidTradeStateBump]
  ] = await Promise.all([
    getAuctionHouseAuthority(wallet.publicKey, treasuryMint, program.programId),
    getBid(auction, buyer.publicKey, program.programId),
    getAtaForMint(treasuryMint, buyer.publicKey),
    getAuctionHouseEscrow(auctionHouse, bidWallet),
    getAuctionHouseTradeState(auctionHouse, bidWallet, auctionEscrow, treasuryMint, nftMint, new anchor.BN(1), bidPrice)
  ]);

  const transaction = new Transaction();

  const ix = await program.methods
    .makeBid(bidPrice, bidWalletBump, bidTradeStateBump, escrowPaymentAccountBump)
    .accounts({
      auction,
      auctionEscrow,
      bidPaymentAccount,
      userTreasuryAta,
      wallet: buyer.publicKey,
      bid,
      auctionBidWallet: bidWallet,
      seller: wallet.publicKey,
      escrowPaymentAccount,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      nftMint,
      treasuryMint,
      metadata,
      candyShop,
      authority,
      bidTradeState,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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
