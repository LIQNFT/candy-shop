import { web3, BN } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

/**
 * Program version that CandyShop was created with
 */
export enum CandyShopVersion {
  V1,
  V2
}

/**
 * Parameters to CandyShop constructor
 *
 * @property {PublicKey} candyShopCreatorAddress
 * @property {PublicKey} treasuryMint
 * @property {PublicKey} candyShopProgramId
 * @property {web3.Cluster} env
 * @property {Partial<CandyShopSettings>} settings
 * @property {boolean} isEnterprise
 */

export interface CandyShopConstructorParams {
  /** Creator address (i.e. your wallet address) */
  candyShopCreatorAddress: web3.PublicKey;
  /** Treasury mint (i.e. currency to buy and sell with) */
  treasuryMint: web3.PublicKey;
  /** Candy Shop program id */
  candyShopProgramId: web3.PublicKey;
  /** web3.Cluster mainnet, devnet */
  env: web3.Cluster;
  /** Optional, additional shop settings */
  settings?: Partial<CandyShopSettings>;
  /** Indicates if this shop uses enterprise program functionality. Defaults to false */
  isEnterprise?: boolean;
}

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
 * Arguments required for calling Update Candy Shop action
 *
 * @property {AnchorWallet | Keypair} wallet
 * @property {BN | null} sellerFeeBasisPoint
 * @property {PublicKey | null} newAuthority
 */
export interface CandyShopUpdateParams {
  /** User wallet keypair */
  wallet: AnchorWallet | web3.Keypair;
  /** Updated valuse for sellerFeeBasisPoint */
  sellerFeeBasisPoint: BN | null;
  /** Updated valuse for requiresSignOff */
  requiresSignOff: boolean | null;
  /** Updated valuse for canChangeSalePrice */
  canChangeSalePrice: boolean | null;
  /** fee split of the shop */
  split: BN | null;
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
 * @property {PublicKey} seller Public key of seller of NFT
 */

export interface CandyShopBuyParams extends CandyShopActionParams {
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

export interface CandyShopTradeBuyParams extends CandyShopBuyParams {
  connection: web3.Connection;
  shopAddress: web3.PublicKey;
  shopCreatorAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  shopTreasuryMint: web3.PublicKey;
  isEnterprise: boolean;
  candyShopVersion: CandyShopVersion;
}

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
  /** Minimum bid increment to outbid highest bid this auction */
  tickSize: BN;
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
