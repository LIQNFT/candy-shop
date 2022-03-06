import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
  Keypair, PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction
} from "@solana/web3.js";
import { AUCTION_HOUSE_PROGRAM_ID, WRAPPED_SOL_MINT } from "../constants";
import {
  getAtaForMint,
  getAuctionHouseEscrow
} from "../utils";
import { IBuyOrder } from "./buy";
import { ISellOrder } from "./sell";

/**
 * Assume the seller is the wallet and the counterParty is the buyer
 * @param walletKeyPair
 * @param counterParty
 * @param tokenAccount
 * @param tokenAccountMint
 * @param treasuryMint
 * @param metadata
 * @param authority
 * @param authorityBump
 * @param auctionHouse
 * @param feeAccount
 * @param price
 * @param program
 */
export async function executeSale(
  walletKeyPair: Keypair,
  counterParty: PublicKey,
  tokenAccount: PublicKey,
  tokenAccountMint: PublicKey,
  treasuryMint: PublicKey,
  auctionHouseTreasury: PublicKey,
  metadata: PublicKey,
  authority: PublicKey,
  authorityBump: number,
  auctionHouse: PublicKey,
  feeAccount: PublicKey,
  candyShop: PublicKey,
  price: anchor.BN,
  amount: anchor.BN,
  sellerOrder: ISellOrder,
  buyerOrder: IBuyOrder,
  program: anchor.Program
) {


  const [escrow, escrowBump] = await getAuctionHouseEscrow(
    auctionHouse,
    walletKeyPair.publicKey
  );


  const transaction = new Transaction();

  const isNative = treasuryMint.equals(WRAPPED_SOL_MINT);

  const ix = await program.instruction.executeSaleWithProxy(
    price,
    amount,
    escrowBump,
    sellerOrder.ahFreeTradeStateBump,
    sellerOrder.ahProgramAsSignerBump,
    authorityBump,
    true,
    {
      accounts: {
        buyer: walletKeyPair.publicKey,
        seller: counterParty,
        tokenAccount,
        tokenMint: tokenAccountMint,
        metadata,
        treasuryMint,
        escrowPaymentAccount: escrow,
        sellerPaymentReceiptAccount: isNative
          ? counterParty
          : (
              await getAtaForMint(treasuryMint, counterParty)
            )[0],
        buyerReceiptTokenAccount: (
          await getAtaForMint(tokenAccountMint, walletKeyPair.publicKey)
        )[0],
        authority,
        auctionHouse,
        auctionHouseFeeAccount: feeAccount,
        auctionHouseTreasury,
        buyerTradeState: buyerOrder.ahBuyerTradeState,
        sellerTradeState: sellerOrder.ahSellerTradeState,
        freeTradeState: sellerOrder.ahFreeTradeState,
        candyShop,
        ahProgram: AUCTION_HOUSE_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        programAsSigner: sellerOrder.ahProgramAsSigner,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  );

  transaction.add(ix);
  const txId = await sendAndConfirmTransaction(
    program.provider.connection,
    transaction,
    [walletKeyPair]
  );
  console.log("sale executed");
}
