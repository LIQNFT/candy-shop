export enum BidStatus {
  OPEN,
  WITHDRAWN,
  WON,
  LOST
}

export interface AuctionBid {
  auctionAddress: string;
  bidAddress: string;
  buyerAddress: string;
  price: string;
  status: BidStatus;
}
