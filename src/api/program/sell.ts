import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  sendAndConfirmRawTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction
} from '@solana/web3.js';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';
import {
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState
} from '../utils';

export async function sellNft(
  wallet: AnchorWallet,
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
): Promise<string> {
  const [tradeState, tradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    wallet.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    price
  );

  const [freeTradeState, freeTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    wallet.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    new anchor.BN(0)
  );
  const [
    programAsSigner,
    programAsSignerBump,
  ] = await getAuctionHouseProgramAsSigner();

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

  transaction.add(ix);

  const signedTx = await wallet.signTransaction(transaction);

  const txHash = await sendAndConfirmRawTransaction(
    program.provider.connection,
    signedTx.serialize()
  );

  console.log('sell order placed');

  return txHash;
}
