import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair, PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction
} from "@solana/web3.js";
import { AUCTION_HOUSE_PROGRAM_ID } from "../constants";
import {
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState
} from "../utils";

export interface ISellOrder {
  ahSellerTradeState: PublicKey,
  ahSellerTradeStateBump: number,
  ahFreeTradeState: PublicKey,
  ahFreeTradeStateBump: number,
  ahProgramAsSigner: PublicKey,
  ahProgramAsSignerBump: number,
  txHash: string,
}

export async function sellNft(
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
): Promise<ISellOrder> {

  const [tradeState, tradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    walletKeyPair.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    price
  );

  const [freeTradeState, freeTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    walletKeyPair.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    new anchor.BN(0)
  );
  const [programAsSigner, programAsSignerBump] = await
    getAuctionHouseProgramAsSigner();

  const transaction = new Transaction();

  const ix = await program.instruction.sellWithProxy(
    price,
    amount,
    tradeStateBump,
    freeTradeStateBump,
    programAsSignerBump,
    authorityBump,
    {
      accounts: {
        wallet: walletKeyPair.publicKey,
        tokenAccount,
        metadata,
        authority,
        auctionHouse,
        auctionHouseFeeAccount: feeAccount,
        sellerTradeState: tradeState,
        freeSellerTradeState: freeTradeState,
        candyShop,
        ahProgram: AUCTION_HOUSE_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        programAsSigner,
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
  console.log("sell order placed")

  return {
    ahSellerTradeState: tradeState,
    ahSellerTradeStateBump: tradeStateBump,
    ahFreeTradeState: freeTradeState,
    ahFreeTradeStateBump: freeTradeStateBump,
    ahProgramAsSigner: programAsSigner,
    ahProgramAsSignerBump: programAsSignerBump,
    txHash
  }
}
