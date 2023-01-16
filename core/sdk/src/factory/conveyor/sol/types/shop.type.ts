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
  extensionPeriod?: anchor.BN;
  extensionIncrement?: anchor.BN;
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

export interface EditionDropParams {
  candyShop: web3.PublicKey;
  vaultAccount: web3.PublicKey;
  nftOwnerTokenAccount: web3.PublicKey;
  masterMint: web3.PublicKey;
  whitelistMint?: web3.PublicKey;
  program: Program<anchor.Idl>;
}

export interface CommitNftParams extends EditionDropParams {
  nftOwner: AnchorWallet | web3.Keypair;
  price: BN;
  startTime: BN;
  salesPeriod: BN;
  hasRedemption: boolean;
  whitelistTime?: BN;
  candyShopProgram: Program<Idl>;
}

export interface MintPrintParams extends EditionDropParams {
  editionBuyer: AnchorWallet | web3.Keypair;
  newEditionTokenAccount: web3.PublicKey;
  newEditionMint: web3.Keypair;
  auctionHouse: web3.PublicKey;
  editionNumber: BN;
  treasuryMint: web3.PublicKey;
}

export interface MintPrintWithInfoParams extends MintPrintParams {
  mintReceipt: web3.PublicKey;
  info: string;
}

export interface RedeemNftParams extends EditionDropParams {
  nftOwner: AnchorWallet | web3.Keypair;
}

export interface UpdateEditionVaultParams extends EditionDropParams {
  nftOwner: AnchorWallet | web3.Keypair;
  newPrice: BN;
}
