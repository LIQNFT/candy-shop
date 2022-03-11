import * as anchor from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js';
import { AUCTION_HOUSE_PROGRAM_ID, WRAPPED_SOL_MINT } from '../constants';
import {
  getAtaForMint,
} from '../utils';

export type BuyAndExecuteSaleAccounts = {
  walletKeyPair: Keypair;
  seller: PublicKey;
  tokenAccount: PublicKey;
  tokenAccountMint: PublicKey;
  treasuryMint: PublicKey;
  auctionHouseTreasury: PublicKey;
  metadata: PublicKey;
  authority: PublicKey;
  auctionHouse: PublicKey;
  tradeState: PublicKey;
  buyerEscrow: PublicKey;
  sellerTradeState: PublicKey;
  freeTradeState: PublicKey;
  programAsSigner: PublicKey;
  feeAccount: PublicKey;
  candyShop: PublicKey;
};

export type BuyAndExecuteSaleData = {
  price: anchor.BN;
  amount: anchor.BN;
  tradeStateBump: number;
  buyerEscrowBump: number;
  authorityBump: number;
  freeTradeStateBump: number;
  programAsSignerBump: number;
};

export async function buyAndExecuteSale(
  accounts: BuyAndExecuteSaleAccounts,
  args: BuyAndExecuteSaleData,
  program: anchor.Program
) {
  const {
    auctionHouse,
    walletKeyPair,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    metadata,
    authority,
    feeAccount,
    candyShop,
    tradeState,
    buyerEscrow,
    seller,
    auctionHouseTreasury,
    sellerTradeState,
    freeTradeState,
    programAsSigner
  } = accounts;
  const {
    amount,
    price,
    authorityBump,
    freeTradeStateBump,
    programAsSignerBump,
    tradeStateBump,
    buyerEscrowBump,
  } = args;

  const isNative = treasuryMint.equals(WRAPPED_SOL_MINT);
  const ata = (await getAtaForMint(treasuryMint, walletKeyPair.publicKey))[0];

  const transaction = new Transaction();

  const ix = (program.instruction.buyWithProxy as (...args: any) => any)(
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

  const ix2 = (program.instruction.executeSaleWithProxy as (...args: any) => any)(
    price,
    amount,
    buyerEscrowBump,
    freeTradeStateBump,
    programAsSignerBump,
    authorityBump,
    true,
    {
      accounts: {
        buyer: walletKeyPair.publicKey,
        seller,
        tokenAccount,
        tokenMint: tokenAccountMint,
        metadata,
        treasuryMint,
        escrowPaymentAccount: buyerEscrow,
        sellerPaymentReceiptAccount: isNative
          ? seller
          : (await getAtaForMint(treasuryMint, seller))[0],
        buyerReceiptTokenAccount: (
          await getAtaForMint(tokenAccountMint, walletKeyPair.publicKey)
        )[0],
        authority,
        auctionHouse,
        auctionHouseFeeAccount: feeAccount,
        auctionHouseTreasury,
        buyerTradeState: tradeState,
        sellerTradeState: sellerTradeState,
        freeTradeState: freeTradeState,
        candyShop,
        ahProgram: AUCTION_HOUSE_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        programAsSigner: programAsSigner,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  );

  transaction.add(ix);
  transaction.add(ix2);
  await sendAndConfirmTransaction(
    program.provider.connection,
    transaction,
    [walletKeyPair]
  );
  console.log('buy and sale executed');
}
