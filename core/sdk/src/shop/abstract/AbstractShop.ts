import { Blockchain, ShopSettings } from './AbstractShopTypes';

export interface AbstractShop {
  shopId(): string;
  ownerAddress(): string;
  treasuryMint(): string;
  settings(): Partial<ShopSettings>;
  blockchain(): Blockchain;

  // Marketplace
  marketplaceBuy(params: any): Promise<string>;
  marketplaceSell(params: any): Promise<string>;
  marketplaceCancel(params: any): Promise<string>;

  // Auction
  createAuction(params: any): Promise<string>;
  cancelAuction(params: any): Promise<string>;
  bidAuction(params: any): Promise<string>;
  withdrawAuctionBid(params: any): Promise<string>;
  buyNowAuction(params: any): Promise<string>;
  settleAndDistributeAuctionProceeds(params: any): Promise<string>;

  // Edition Drop
  commitMasterNft(params: any): Promise<string>;
  mintNewPrint(params: any): Promise<string>;
  redeemDrop(params: any): Promise<string>;
}
