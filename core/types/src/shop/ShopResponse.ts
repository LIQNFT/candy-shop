import { Blockchain } from '../commonQuery';

export interface CandyShop {
  candyShopAddress: string;
  candyShopName: string;
  programId: string;
  treasuryAddress: string;
  treasuryMint: string;
  feeAccountAddress: string;
  feeSplit: number;
  feeRate: number;
  symbol: string;
  decimals: number;
  logoURI: string;
  txHashAtCreation: string;
  allowSellAnyNft: number;
  imageUrl: string;
  websiteUrl: string;
  discordUrl: string;
  twitterUrl: string;
  blockchain: Omit<Blockchain, 'devnet' | 'mainnet-beta'>;
  connectionUrl: string;
  accessToken: string;
}

export interface ShopStatus {
  timestamp: number;
  type: ShopStatusType;
}

export enum ShopStatusType {
  Order = 'ORDER',
  Trade = 'TRADE',
  UserNft = 'USER_NFT',
  Auction = 'AUCTION'
}

export interface ShopStats {
  floorPrice: string | null;
  totalVolume: string;
  averageSalesPrice: string | null;
  totalListed: string;
}
