import { CandyShopSettings } from './SolanaCandyShopModel';

import { Blockchain } from './CandyShopModel';

export interface CandyShop {
  shopId(): string;
  ownerAddress(): string;
  treasuryMint(): string;
  settings(): Partial<CandyShopSettings>;
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
