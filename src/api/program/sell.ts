import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';


export type SellNftAccounts = {
  wallet: anchor.Wallet;
  tokenAccount: PublicKey;
  metadata: PublicKey;
  authority: PublicKey;
  auctionHouse: PublicKey;
  tradeState: PublicKey;
  freeTradeState: PublicKey;
  feeAccount: PublicKey;
  candyShop: PublicKey;
  programAsSigner: PublicKey;
};

export type SellNftData = {
  price: anchor.BN;
  amount: anchor.BN;
  tradeStateBump: number;
  freeTradeStateBump: number;
  programAsSignerBump: number;
  authorityBump: number;
};

export async function sellNft(
  accounts: SellNftAccounts,
  data: SellNftData,
  program: anchor.Program<anchor.Idl>
) {
  const {
    wallet,
    auctionHouse,
    tokenAccount,
    metadata,
    authority,
    feeAccount,
    candyShop,
    tradeState,
    freeTradeState,
    programAsSigner
  } = accounts;

  const { amount, price, authorityBump, tradeStateBump, freeTradeStateBump, programAsSignerBump } = data;

  const transaction = new Transaction();

  const ix = (program.instruction.sellWithProxy as (...args: any) => any)(
    price,
    amount,
    tradeStateBump,
    freeTradeStateBump,
    programAsSignerBump,
    authorityBump,
    {
      accounts: {
        wallet: wallet.publicKey,
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

  const signedTxn = await wallet.signTransaction(transaction)

  await sendAndConfirmTransaction(program.provider.connection, signedTxn, []);

  console.log('sell order placed');
}
