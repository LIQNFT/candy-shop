import { web3, BN, Program, Idl } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ShopSettings } from './shop/base/BaseShopModel';

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
 * Explorer link source on checking on-chain information
 */

export enum ExplorerLinkBase {
  SolScan = 'SolScan',
  SolanaFM = 'SolanaFM',
  Explorer = 'Explorer'
}

/**
 * Custom CandyShop settings
 */
export interface CandyShopSettings extends ShopSettings {
  /** Explorer link */
  explorerLink: ExplorerLinkBase;
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
}

export interface CandyShopTradeSellParams extends CandyShopSellParams {
  connection: web3.Connection;
  shopAddress: web3.PublicKey;
  shopCreatorAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  shopTreasuryMint: web3.PublicKey;
}

export interface CandyShopTradeCancelParams extends CandyShopCancelParams {
  connection: web3.Connection;
  shopAddress: web3.PublicKey;
  shopCreatorAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  shopTreasuryMint: web3.PublicKey;
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
  /** Buy now price for auction, nullable */
  buyNowPrice: BN | null;
  /** Period of time (seconds) before auction end time when bids will extend the auction, optional */
  extensionPeriod?: BN;
  /** Amount of time to extend auction by when late bids come in, optional */
  extensionIncrement?: BN;
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

export interface CandyShopAuctionBidParams extends CandyShopAuctionParams {
  shopAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  shopTreasuryMint: web3.PublicKey;
  shopCreatorAddress: web3.PublicKey;
  connection: web3.Connection;
  version: CandyShopVersion;
  bidPrice: BN;
}

/**
 * Arguments required for calling Candy Shop withdraw auction bid action
 */
export interface CandyShopWithdrawAuctionBidParams extends CandyShopAuctionParams {}

export interface CandyShopAuctionWithdrawBidParams extends CandyShopAuctionParams {
  shopAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  shopTreasuryMint: web3.PublicKey;
  shopCreatorAddress: web3.PublicKey;
  connection: web3.Connection;
  version: CandyShopVersion;
}

/**
 * Arguments required for calling Candy Shop the auction buy now action
 */
export interface CandyShopBuyNowParams extends CandyShopAuctionParams {}

export interface CandyShopAuctionBuyNowParams extends CandyShopAuctionParams {
  shopAddress: web3.PublicKey;
  shopCreatorAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  shopTreasuryMint: web3.PublicKey;
  connection: web3.Connection;
  env: web3.Cluster;
  version: CandyShopVersion;
}

/**
 * Arguments required for calling Candy Shop settle auction and distribute proceed actions
 */
export interface CandyShopSettleAndDistributeParams extends CandyShopAuctionParams {}

interface CandyShopEditionDropParams {
  nftOwnerTokenAccount: web3.PublicKey;
  masterMint: web3.PublicKey;
  whitelistMint?: web3.PublicKey;
}

export interface CandyShopCommitNftParams extends CandyShopEditionDropParams {
  nftOwner: AnchorWallet | web3.Keypair;
  price: BN;
  startTime: BN;
  salesPeriod: BN;
  whitelistTime?: BN;
}

export interface CandyShopMintPrintParams extends CandyShopEditionDropParams {
  editionBuyer: AnchorWallet | web3.Keypair;
}

export interface CandyShopRedeemParams extends CandyShopEditionDropParams {
  nftOwner: AnchorWallet | web3.Keypair;
}

interface EditionDropParams extends CandyShopEditionDropParams {
  isEnterprise: boolean;
  candyShop: web3.PublicKey;
  connection: web3.Connection;
  candyShopProgram: Program<Idl>;
}

export interface EditionDropCommitNftParams extends EditionDropParams, CandyShopCommitNftParams {}

export interface EditionDropMintPrintParams extends EditionDropParams, CandyShopMintPrintParams {
  auctionHouse: web3.PublicKey;
  treasuryMint: web3.PublicKey;
}

export interface EditionDropRedeemParams extends EditionDropParams, CandyShopRedeemParams {}
