import { web3, BN, Program, Idl } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export interface CandyShopTransactionParams {
  wallet: AnchorWallet | web3.Keypair;
  tokenAccount: web3.PublicKey;
  tokenAccountMint: web3.PublicKey;
  treasuryMint: web3.PublicKey;
  authority: web3.PublicKey;
  authorityBump: number;
  auctionHouse: web3.PublicKey;
  feeAccount: web3.PublicKey;
  candyShop: web3.PublicKey;
  price: BN;
  amount: BN;
  program: Program<Idl>;
}

export interface BuyAndExecuteSaleTransactionParams extends CandyShopTransactionParams {
  counterParty: web3.PublicKey;
  auctionHouseTreasury: web3.PublicKey;
  metadata: web3.PublicKey;
}

export interface SellTransactionParams extends CandyShopTransactionParams {
  metadata: web3.PublicKey;
}

export interface CancelTransactionParams extends CandyShopTransactionParams {
  tradeState: web3.PublicKey;
}
