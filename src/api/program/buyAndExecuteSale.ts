import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { AUCTION_HOUSE_PROGRAM_ID, WRAPPED_SOL_MINT } from "../constants";
import {
  getAtaForMint,
  getAuctionHouseEscrow,
  getAuctionHouseTradeState,
} from "../utils";
import { ISellOrder } from "./sell";

export async function buyAndExecuteSale(
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
  program: anchor.Program
) {
  const [buyerEscrow, buyerEscrowBump] = await getAuctionHouseEscrow(
    auctionHouse,
    walletKeyPair.publicKey
  );

  const [tradeState, tradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    walletKeyPair.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    price
  );

  const isNative = treasuryMint.equals(WRAPPED_SOL_MINT);
  const ata = (await getAtaForMint(treasuryMint, walletKeyPair.publicKey))[0];

  const transaction = new Transaction();

  const ix = await program.instruction.buyWithProxy(
    price,
    amount,
    tradeStateBump,
    buyerEscrowBump,
    authorityBump,
    {
      accounts: {
        wallet: walletKeyPair.publicKey,
        paymentAccount: isNative ? walletKeyPair.publicKey : ata,
        transferAuthority: walletKeyPair.publicKey,
        treasuryMint,
        tokenAccount,
        metadata,
        escrowPaymentAccount: buyerEscrow,
        authority,
        auctionHouse,
        auctionHouseFeeAccount: feeAccount,
        buyerTradeState: tradeState,
        candyShop,
        ahProgram: AUCTION_HOUSE_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  );

  const ix2 = await program.instruction.executeSaleWithProxy(
    price,
    amount,
    buyerEscrowBump,
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
        escrowPaymentAccount: buyerEscrow,
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
        buyerTradeState: tradeState,
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
  transaction.add(ix2);
  const txId = await sendAndConfirmTransaction(
    program.provider.connection,
    transaction,
    [walletKeyPair]
  );
  console.log("buy and sale executed");
}
