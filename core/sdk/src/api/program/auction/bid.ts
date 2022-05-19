import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey, SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import {
  getAtaForMint,
  getAuction,
  getAuctionHouseAuthority,
  getAuctionHouseEscrow,
  getAuctionHouseTradeState,
  getBid,
  getBidWallet,
  getCandyShop,
  sendTx
} from '../..';
import { WRAPPED_SOL_MINT, AUCTION_HOUSE_PROGRAM_ID } from '../../constants';
import { requestExtraCompute } from './requestExtraCompute';

export const bid = async (
  wallet: AnchorWallet | Keypair,
  buyer: Keypair,
  treasuryMint: PublicKey,
  nftMint: PublicKey,
  metadata: PublicKey,
  auctionHouse: PublicKey,
  feeAccount: PublicKey,
  bidPrice: anchor.BN,
  program: anchor.Program
) => {
  const isNative = treasuryMint.equals(WRAPPED_SOL_MINT);

  const [candyShop] = await getCandyShop(wallet.publicKey, treasuryMint, program.programId);

  const [auction] = await getAuction(candyShop, nftMint, program.programId);

  const [auctionEscrow] = await getAtaForMint(nftMint, auction);

  const [authority] = await getAuctionHouseAuthority(wallet.publicKey, treasuryMint, program.programId);

  const [bid] = await getBid(auction, buyer.publicKey, program.programId);

  const [bidWallet, bidWalletBump] = await getBidWallet(auction, buyer.publicKey, program.programId);

  const [userTreasuryAta] = await getAtaForMint(treasuryMint, buyer.publicKey);

  const bidPaymentAccount = isNative ? bidWallet : (await getAtaForMint(treasuryMint, bidWallet))[0];

  const [escrowPaymentAccount, escrowPaymentAccountBump] = await getAuctionHouseEscrow(auctionHouse, bidWallet);

  const [bidTradeState, bidTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    bidWallet,
    auctionEscrow,
    treasuryMint,
    nftMint,
    new anchor.BN(1),
    bidPrice
  );

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

  transaction.add(requestExtraCompute(400000), ix);

  const txId = await sendTx(wallet, transaction, program);
  console.log('Bid made with txId ==', txId);

  return {
    escrowPaymentAccount,
    bidTradeState,
    bidTradeStateBump,
    txId
  };
};
