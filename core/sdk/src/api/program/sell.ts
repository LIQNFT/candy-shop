import * as anchor from '@project-serum/anchor';
import { web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';
import {
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState
} from '../utils';

export async function sellNft(
  wallet: AnchorWallet | web3.Keypair,
  tokenAccount: anchor.web3.PublicKey,
  tokenAccountMint: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  metadata: anchor.web3.PublicKey,
  authority: anchor.web3.PublicKey,
  authorityBump: number,
  auctionHouse: anchor.web3.PublicKey,
  feeAccount: anchor.web3.PublicKey,
  candyShop: anchor.web3.PublicKey,
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
  const [programAsSigner, programAsSignerBump] =
    await getAuctionHouseProgramAsSigner();

  const txHash = await program.rpc.sellWithProxy(
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
        systemProgram: anchor.web3.SystemProgram.programId,
        programAsSigner,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      }
    }
  );

  console.log('sell order placed');

  return txHash;
}
