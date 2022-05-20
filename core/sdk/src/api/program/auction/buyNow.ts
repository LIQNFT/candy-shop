import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SYSVAR_CLOCK_PUBKEY, Transaction } from '@solana/web3.js';
import {
  getAtaForMint,
  getAuction,
  getAuctionHouseAuthority,
  getAuctionHouseEscrow,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  getCandyShop,
  sendTx,
  treasuryMintIsNative
} from '../..';
import { AUCTION_HOUSE_PROGRAM_ID } from '../../constants';
import { BuyNowAuctionParams } from '../../model';

export const buyNowAuction = async ({
  wallet,
  buyer,
  treasuryMint,
  nftMint,
  metadata,
  auctionHouse,
  feeAccount,
  treasuryAccount,
  buyNowPrice,
  program
}: BuyNowAuctionParams) => {
  const isNative = treasuryMintIsNative(treasuryMint);

  const [candyShop] = await getCandyShop(wallet.publicKey, treasuryMint, program.programId);

  const [auction, auctionBump] = await getAuction(candyShop, nftMint, program.programId);

  const [auctionEscrow] = await getAtaForMint(nftMint, auction);

  const [authority] = await getAuctionHouseAuthority(wallet.publicKey, treasuryMint, program.programId);

  const [buyerReceiptTokenAccount] = await getAtaForMint(nftMint, buyer.publicKey);

  const sellerPaymentReceiptAccount = isNative
    ? wallet.publicKey
    : (await getAtaForMint(treasuryMint, wallet.publicKey))[0];

  const paymentAccount = isNative ? buyer.publicKey : (await getAtaForMint(treasuryMint, buyer.publicKey))[0];

  const auctionPaymentReceiptAccount = isNative ? auction : (await getAtaForMint(treasuryMint, auction))[0];

  const [escrowPaymentAccount, escrowPaymentAccountBump] = await getAuctionHouseEscrow(auctionHouse, buyer.publicKey);

  const [auctionTradeState, auctionTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    auction,
    auctionEscrow,
    treasuryMint,
    nftMint,
    new anchor.BN(1),
    buyNowPrice
  );

  const [freeAuctionTradeState, freeAuctionTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    auction,
    auctionEscrow,
    treasuryMint,
    nftMint,
    new anchor.BN(1),
    new anchor.BN(0)
  );

  const [buyerTradeState, buyerTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    buyer.publicKey,
    auctionEscrow,
    treasuryMint,
    nftMint,
    new anchor.BN(1),
    buyNowPrice
  );

  const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner();

  const transaction = new Transaction();

  const ix = await program.methods
    .buyNow(
      auctionBump,
      auctionTradeStateBump,
      buyerTradeStateBump,
      escrowPaymentAccountBump,
      freeAuctionTradeStateBump,
      programAsSignerBump
    )
    .accounts({
      auction,
      auctionEscrow,
      sellerPaymentReceiptAccount,
      buyerReceiptTokenAccount,
      paymentAccount,
      transferAuthority: buyer.publicKey,
      wallet: buyer.publicKey,
      seller: wallet.publicKey,
      escrowPaymentAccount,
      auctionPaymentReceiptAccount,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      auctionHouseTreasury: treasuryAccount,
      nftMint,
      treasuryMint,
      metadata,
      candyShop,
      authority,
      buyerTradeState,
      auctionTradeState,
      freeAuctionTradeState,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID,
      programAsSigner,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY
    })
    .instruction();

  transaction.add(ix);
  const txId = await sendTx(buyer, transaction, program);
  console.log('Buy Now called with txId ==', txId);

  return {
    buyerReceiptTokenAccount,
    sellerPaymentReceiptAccount,
    txId
  };
};
