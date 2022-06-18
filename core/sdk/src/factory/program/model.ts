import * as anchor from '@project-serum/anchor';
import { web3, BN, Program, Idl } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export interface UpdateCandyShopParams {
  wallet: AnchorWallet | web3.Keypair;
  treasuryMint: web3.PublicKey;
  sellerFeeBasisPoint: BN | null;
  requiresSignOff: boolean | null;
  canChangeSalePrice: boolean | null;
  split: BN | null;
  auctionHouse: web3.PublicKey;
  auctionHouseAuthority: web3.PublicKey;
  authorityBump: number;
  program: Program<Idl>;
}

export interface CandyShopTransactionParams {
  wallet: AnchorWallet | web3.Keypair;
  tokenAccount: web3.PublicKey;
  tokenAccountMint: web3.PublicKey;
  treasuryMint: web3.PublicKey;
  authority: web3.PublicKey;
  authorityBump?: number;
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

export interface AuctionParams {
  candyShop: web3.PublicKey;
  treasuryMint: web3.PublicKey;
  authority: web3.PublicKey;
  auction: web3.PublicKey;
  nftMint: web3.PublicKey;
  program: anchor.Program<anchor.Idl>;
}

export interface CreateAuctionParams extends AuctionParams {
  auctionBump: number;
  seller: AnchorWallet | web3.Keypair;
  startingBid: anchor.BN;
  startTime: anchor.BN;
  biddingPeriod: anchor.BN;
  tickSize: anchor.BN;
  buyNowPrice: anchor.BN | null;
}

export interface CancelAuctionParams extends AuctionParams {
  auctionBump: number;
  seller: AnchorWallet | web3.Keypair;
}

export interface BidAuctionParams extends AuctionParams {
  buyer: AnchorWallet | web3.Keypair;
  metadata: web3.PublicKey;
  auctionHouse: web3.PublicKey;
  feeAccount: web3.PublicKey;
  bidPrice: anchor.BN;
}

export interface WithdrawBidParams extends AuctionParams {
  buyer: AnchorWallet | web3.Keypair;
  metadata: web3.PublicKey;
  auctionHouse: web3.PublicKey;
  feeAccount: web3.PublicKey;
}

export interface BuyNowAuctionParams extends AuctionParams {
  buyer: AnchorWallet | web3.Keypair;
  auctionBump: number;
  metadata: web3.PublicKey;
  auctionHouse: web3.PublicKey;
  feeAccount: web3.PublicKey;
  treasuryAccount: web3.PublicKey;
  env: string;
}

export interface SettleAndDistributeProceedParams extends AuctionParams {
  settler: AnchorWallet | web3.Keypair;
  auctionBump: number;
  metadata: web3.PublicKey;
  auctionHouse: web3.PublicKey;
  feeAccount: web3.PublicKey;
  treasuryAccount: web3.PublicKey;
  env: string;
}
