import { Blockchain } from '@liqnft/candy-shop-types';
import { web3, BN, Program, Idl } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShopVersion } from '../base/BaseShopModel';

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
  /** Updated value for sellerFeeBasisPoint */
  sellerFeeBasisPoint: BN | null;
  /** Updated value for requiresSignOff */
  requiresSignOff: boolean | null;
  /** Updated value for canChangeSalePrice */
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
  env: Blockchain;
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
  hasRedemption: boolean;
  whitelistTime?: BN;
  inputSchema: string | undefined;
}

export interface CandyShopMintPrintParams extends CandyShopEditionDropParams {
  editionBuyer: AnchorWallet | web3.Keypair;
  mintEditionNumber?: string;
  info: string | undefined;
}

export interface CandyShopRedeemParams extends CandyShopEditionDropParams {
  nftOwner: AnchorWallet | web3.Keypair;
}

export interface CandyShopUpdateEditionVaultParams extends CandyShopEditionDropParams {
  nftOwner: AnchorWallet | web3.Keypair;
  newPrice: BN;
}

interface EditionDropParams extends CandyShopEditionDropParams {
  isEnterprise: boolean;
  candyShop: web3.PublicKey;
  connection: web3.Connection;
  candyShopProgram: Program<Idl>;
}

export interface EditionDropCommitNftParams extends EditionDropParams, CandyShopCommitNftParams {
  shopId: string;
}

export interface EditionDropMintPrintParams extends EditionDropParams, CandyShopMintPrintParams {
  auctionHouse: web3.PublicKey;
  treasuryMint: web3.PublicKey;
  instructions: web3.TransactionInstruction[];
  newEditionMint: web3.Keypair;
  newEditionTokenAccount: web3.PublicKey;
}

export interface EditionDropRedeemParams extends EditionDropParams, CandyShopRedeemParams {}

export interface EditionDropUpdateParams extends EditionDropParams, CandyShopUpdateEditionVaultParams {}

export interface RegisterRedemptionParams {
  vaultAddress: string;
  editionMint: string;
  walletAddress: string;
  redemptionType: number;
  userInputs: string;
}

export interface RegisterDropParams {
  vaultAddress: string;
  shopId: string;
  redemptionType: number;
  userInputsSchema: string;
}
