export enum CandyShopErrorType {
  TransactionFailed = 'TransactionFailed',
  InsufficientBalance = 'InsufficientBalance',
  NFTUnavailable = 'NFTUnavailable',
  BuyerOwnsListing = 'BuyerOwnsListing',
  InvalidNFTMetadata = 'InvalidNFTMetadata',
  SellerATACannotHaveDelegate = 'SellerATACannotHaveDelegate',
  BuyerATACannotHaveDelegate = 'BuyerATACannotHaveDelegate',
  TradeStateExists = 'TradeStateExists',
  NonShopOwner = 'NonShopOwner',
  AuctionExists = 'AuctionExists',
  AuctionDoesNotExists = 'AuctionDoesNotExists',
  AuctionHasNoBids = 'AuctionHasNoBids',
  BuyNowUnavailable = 'BuyNowUnavailable'
}

export const CandyShopErrorMsgMap = {
  [CandyShopErrorType.TransactionFailed]: 'Transaction failed. Please try again later.',
  [CandyShopErrorType.InsufficientBalance]: 'Insufficient balance.',
  [CandyShopErrorType.NFTUnavailable]: 'The NFT is no longer for sale.',
  [CandyShopErrorType.BuyerOwnsListing]: 'Cannot buy your own listing. Please cancel instead.',
  [CandyShopErrorType.InvalidNFTMetadata]: 'Failed to get metadata account data.',
  [CandyShopErrorType.SellerATACannotHaveDelegate]: 'Seller payment receipt account cannot have a delegate set.',
  [CandyShopErrorType.BuyerATACannotHaveDelegate]: 'Buyer receipt token account cannot have a delegate set.',
  [CandyShopErrorType.TradeStateExists]: 'Sell Order already placed.',
  [CandyShopErrorType.NonShopOwner]: 'Only shop owner can create auction.',
  [CandyShopErrorType.AuctionExists]: 'Auction already exists.',
  [CandyShopErrorType.AuctionDoesNotExists]: 'Auction does not exists.',
  [CandyShopErrorType.AuctionHasNoBids]: 'Auctions without bids cannot be settled.',
  [CandyShopErrorType.BuyNowUnavailable]: 'Buy now is unavailabel on this auction.'
};

export class CandyShopError extends Error {
  public type: CandyShopErrorType;

  constructor(type: CandyShopErrorType) {
    super(CandyShopErrorMsgMap[type]);

    this.type = type;
    Object.setPrototypeOf(this, CandyShopError.prototype);
  }
}
