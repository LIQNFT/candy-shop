import { NftAttribute, NftProperties } from '../nft';

export enum AuctionStatus {
  CREATED,
  STARTED,
  COMPLETE,
  CANCELLED,
  EXPIRED
}

export interface Auction {
  auctionAddress: string;
  tokenAccount: string;
  candyShopAddress: string;
  tokenMint: string;
  sellerAddress: string;
  startingBid: string;
  startTime: string;
  biddingPeriod: string;
  highestBid: string;
  tickSize: string;
  buyNowPrice: string | null;
  status: AuctionStatus;
  highestBidBuyer?: string;
  highestBidPrice?: string;
  userBid?: boolean;
  totalBid?: number;

  nftUri?: string;
  name: string;
  symbol: string;
  description?: string;
  sellerFeeBasisPoint: number;
  image?: string;
  animationUrl?: string;
  attributes?: NftAttribute[];
  externalUri?: string;
  properties?: NftProperties;
}
