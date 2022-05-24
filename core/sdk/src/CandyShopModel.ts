import { web3, BN } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

/**
 * Custom CandyShop settings
 *
 * @property {string} currencySymbol
 * @property {number} currencyDecimals
 * @property {number} priceDecimals
 * @property {number} volumeDecimals
 * @property {string} mainnetConnectionUrl
 * @property {object | undefined} connectionConfig
 */
export interface CandyShopSettings {
  /** Shop transaction currency symbol (default is SOL) */
  currencySymbol: string;
  /** Shop transaction currency decimals (default is 9 for SOL) */
  currencyDecimals: number;
  /** Number of min decimals to display for price numbers (default is 0) */
  priceDecimalsMin: number;
  /** Number of max decimals to display for price numbers (default is 3) */
  priceDecimals: number;
  /** Number of min decimals to display for volume numbers (default is 0) */
  volumeDecimalsMin: number;
  /** Number of max decimals to display for volume numbers (default is 1) */
  volumeDecimals: number;
  /** Rpc connection endpoint */
  mainnetConnectionUrl: string;
  /** Connection config options */
  connectionConfig: object | undefined;
}

/**
 * General arguments required for calling Candy Shop actions
 *
 * @property {PublicKey} tokenAccount
 * @property {PublicKey} tokenMint
 * @property {BN} price
 * @property {AnchorWallet | Keypair} wallet
 */
export interface CandyShopActionParams {
  /** Token account holding NFT */
  tokenAccount: web3.PublicKey;
  /** Mint address of NFT */
  tokenMint: web3.PublicKey;
  /** Asking price for NFT */
  price: BN;
  /** User wallet keypair */
  wallet: AnchorWallet | web3.Keypair;
}

/**
 * Arguments required for calling Candy Shop buy action
 *
 * @property {PublicKey} seller
 */
export interface CandyShopBuyParams extends CandyShopActionParams {
  /** Public key of seller of NFT */
  seller: web3.PublicKey;
}

/**
 * Arguments required for calling Candy Shop sell action
 */
export interface CandyShopSellParams extends CandyShopActionParams {}

/**
 * Arguments required for calling Candy Shop cancel action
 */
export interface CandyShopCancelParams extends CandyShopActionParams {}

/**
 * General arguments required for calling Auction actions
 *
 * @property {PublicKey} tokenAccount
 * @property {PublicKey} tokenMint
 * @property {BN} price
 * @property {AnchorWallet | Keypair} wallet
 */
export interface CandyShopAuctionParams {
  /** Token account holding NFT */
  tokenAccount: web3.PublicKey;
  /** Mint address of NFT */
  tokenMint: web3.PublicKey;
  /** User wallet keypair */
  wallet: AnchorWallet | web3.Keypair;
}

/**
 * Arguments required for calling Candy Shop create auction action
 */
export interface CandyShopCreateAuctionParams extends CandyShopAuctionParams {
  /** Starting bid for auction */
  startingBid: BN;
  /** Start Time for auction */
  startTime: BN;
  /** Bidding period for auction */
  biddingPeriod: BN;
  /** Buynow price for auction, nullable */
  buyNowPrice: BN | null;
}

/**
 * Arguments required for calling Candy Shop cancel auction action
 */
export interface CandyShopCancelAuctionParams extends CandyShopAuctionParams {}

/**
 * Arguments required for calling Candy Shop bid auction action
 */
export interface CandyShopBidAuctionParams extends CandyShopAuctionParams {
  /** bidPrice for auction */
  bidPrice: BN;
}

/**
 * Arguments required for calling Candy Shop withdraw auction bid action
 */
export interface CandyShopWithdrawAuctionBidParams extends CandyShopAuctionParams {}

/**
 * Arguments required for calling Candy Shop the auction buy now action
 */
export interface CandyShopBuyNowParams extends CandyShopAuctionParams {}

/**
 * Arguments required for calling Candy Shop settle auction and distribute proceed actions
 */
export interface CandyShopSettleAndDistributeParams extends CandyShopAuctionParams {}
