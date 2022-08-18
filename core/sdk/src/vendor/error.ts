export enum CandyShopErrorType {
  IncorrectProgramId = 'IncorrectProgramId',
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
  AuctionDoesNotExist = 'AuctionDoesNotExist',
  BidDoesNotExist = 'BidDoesNotExist',
  InvalidAuctionCreationParams = 'InvalidAuctionCreationParams',
  CannotCancel = 'CannotCancel',
  BidTooHigh = 'BidTooHigh',
  BidTooLow = 'BidTooLow',
  NotWithinBidPeriod = 'NotWithinBidPeriod',
  AuctionHasNoBids = 'AuctionHasNoBids',
  CannotWithdraw = 'CannotWithdraw',
  BuyNowUnavailable = 'BuyNowUnavailable',
  AuctionNotOver = 'AuctionNotOver',
  InsufficientFeeAccountBalance = 'InsufficientFeeAccountBalance',
  TooManyCreators = 'TooManyCreators',
  CandyShopDoesNotExist = 'CandyShopDoesNotExist',
  InvalidTreasuryMint = 'InvalidTreasuryMint',
  InvalidNftOwner = 'InvalidNftOwner',
  IncorrectCandyShopType = 'IncorrectCandyShopType',
  VaultDoesNotExist = 'VaultDoesNotExist',
  NotWithinSalesPeriod = 'NotWithinSalesPeriod',
  DropNotRedeemable = 'DropNotRedeemable',
  NotReachable = 'NotReachable'
}

export const CandyShopErrorMsgMap = {
  [CandyShopErrorType.IncorrectProgramId]: 'Must use v2 program address to make use of this functionality.',
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
  [CandyShopErrorType.AuctionDoesNotExist]: 'Auction does not exist.',
  [CandyShopErrorType.BidDoesNotExist]: 'Bid does not exist.',
  [CandyShopErrorType.AuctionHasNoBids]: 'Auctions without bids cannot be settled.',
  [CandyShopErrorType.BuyNowUnavailable]: 'Buy now is unavailable on this auction.',
  [CandyShopErrorType.CannotCancel]: 'This auction cannot be cancelled at this time.',
  [CandyShopErrorType.BidTooHigh]:
    'Bid price is higher than auction buy now price. Please call that instruction instead.',
  [CandyShopErrorType.BidTooLow]: 'Bid price is too low to beat current highest bid.',
  [CandyShopErrorType.NotWithinBidPeriod]: 'Attempted to place a bid outside of auction bid period.',
  [CandyShopErrorType.CannotWithdraw]:
    'This bid is currently the highest for the auction, it cannot be withdrawn at this time.',
  [CandyShopErrorType.InvalidAuctionCreationParams]:
    'One or more of the passed auction creation parameters are invalid.',
  [CandyShopErrorType.AuctionNotOver]: 'Attempted to settle and auction that is not over.',
  [CandyShopErrorType.InsufficientFeeAccountBalance]:
    'Please contact shop owner to top up shop syrup balance. Min balance requirement 0.05 SOL.',
  [CandyShopErrorType.TooManyCreators]: 'Nft has too many listed creators.',
  [CandyShopErrorType.CandyShopDoesNotExist]: 'Candy Shop does not exist.',
  [CandyShopErrorType.InvalidTreasuryMint]: 'Treasury mint must be wrapped SOL to use edition drop program.',
  [CandyShopErrorType.InvalidNftOwner]: 'Caller must be Candy Shop creator.',
  [CandyShopErrorType.IncorrectCandyShopType]: 'Candy Shop is of the incorrect type (enterprise or regular).',
  [CandyShopErrorType.VaultDoesNotExist]: 'Vault account does not exist.',
  [CandyShopErrorType.NotWithinSalesPeriod]: 'Attempted to mint print outside of sales period.',
  [CandyShopErrorType.DropNotRedeemable]: 'Drop not redeemable',
  [CandyShopErrorType.NotReachable]: 'Unknown error. Please contact CandyShop team for further info.'
};

export class CandyShopError extends Error {
  public type: CandyShopErrorType;

  constructor(type: CandyShopErrorType) {
    super(CandyShopErrorMsgMap[type]);

    this.type = type;
    Object.setPrototypeOf(this, CandyShopError.prototype);
  }
}
