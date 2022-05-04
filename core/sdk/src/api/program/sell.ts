import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SellTransactionParams } from '../model';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';
import { getAuctionHouseProgramAsSigner, getAuctionHouseTradeState } from '../utils';

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

  const txHash = await program.methods
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
    .rpc();

  console.log('sell order placed');

  return txHash;
}
