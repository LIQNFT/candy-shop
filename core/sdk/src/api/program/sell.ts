import * as anchor from '@project-serum/anchor';
import { createRevokeInstruction, getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SellTransactionParams } from '../model';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';
import {
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  getAtaForMint,
  sendTx,
  treasuryMintIsNative
} from '../utils';
import { safeAwait } from '../../utils';

export async function sellNft(params: SellTransactionParams): Promise<string> {
  const {
    wallet,
    tokenAccount,
    tokenAccountMint,
    treasuryMint,
    metadata,
    authority,
    authorityBump,
    auctionHouse,
    feeAccount,
    candyShop,
    price,
    amount,
    program
  } = params;

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
  const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner();

  const transaction = new anchor.web3.Transaction();

  const isNative = treasuryMintIsNative(treasuryMint);

  if (!isNative) {
    const sellerPaymentReceiptAccount = (await getAtaForMint(treasuryMint, wallet.publicKey))[0];
    const sellerPaymentReceiptAccountInfo = (
      await safeAwait(getAccount(program.provider.connection, sellerPaymentReceiptAccount))
    ).result;

    if (sellerPaymentReceiptAccountInfo && sellerPaymentReceiptAccountInfo.delegate) {
      transaction.add(createRevokeInstruction(sellerPaymentReceiptAccount, wallet.publicKey));
    }
  }

  const ix = await program.methods
    .sellWithProxy(price, amount, tradeStateBump, freeTradeStateBump, programAsSignerBump, authorityBump)
    .accounts({
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
      systemProgram: anchor.web3.SystemProgram.programId,
      programAsSigner,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    })
    .instruction();

  transaction.add(ix);

  const txHash = await sendTx(wallet, transaction, program);

  console.log('sell order placed');

  return txHash;
}
