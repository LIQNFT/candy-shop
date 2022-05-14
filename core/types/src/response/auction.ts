export enum AuctionStatus {
  CREATED,
  STARTED,
  COMPLETE,
  CANCELLED
}

export interface Auction {
  auctionAddress: string;
  tokenAccount: string;
  candyShopAddress: string;
  tokenMint: string;
  sellerAddress: string;
  startingBid: string;
  startTime: string;
  biddingPeroid: string;
  highestBid: string;
  buyNowPrice: string | null;
  status: AuctionStatus;
}
