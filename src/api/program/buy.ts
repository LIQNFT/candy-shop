import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
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
  getAuctionHouseEscrow, getAuctionHouseTradeState
} from "../utils";

export interface IBuyOrder {
  ahBuyerTradeState: PublicKey,
  ahBuyerTradeStateBump: number,
  txHash:string,
}

export async function buyNft(
  walletKeyPair: Keypair,
  tokenAccount: PublicKey,
  tokenAccountMint: PublicKey,
  treasuryMint: PublicKey,
  metadata: PublicKey,
  authority: PublicKey,
  authorityBump: number,
  auctionHouse: PublicKey,
  feeAccount: PublicKey,
  candyShop: PublicKey,
  price: anchor.BN,
  amount: anchor.BN,
  program: anchor.Program
): Promise<IBuyOrder> {

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

  const transaction = new Transaction();

  const isNative = treasuryMint.equals(WRAPPED_SOL_MINT);
  const ata = (await getAtaForMint(treasuryMint, walletKeyPair.publicKey))[0];

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

  transaction.add(ix);
  const txHash = await sendAndConfirmTransaction(
    program.provider.connection,
    transaction,
    [walletKeyPair]
  );
  console.log("buy order placed")
  return {
    ahBuyerTradeState: tradeState,
    ahBuyerTradeStateBump: tradeStateBump,
    txHash,
  }
}
