import { ShopSettings, Blockchain } from './BaseShopModel';

export abstract class BaseShop {
  constructor(params: any) {}

  // Properties
  abstract get candyShopAddress(): string;
  abstract get candyShopCreatorAddress(): string;
  abstract get treasuryMint(): string;
  abstract get settings(): Partial<ShopSettings>;
  abstract get blockchain(): Blockchain;
  abstract get baseUnitsPerCurrency(): number;
  abstract get currencySymbol(): string;
  abstract get currencyDecimals(): number;
  abstract get priceDecimalsMin(): number;
  abstract get priceDecimals(): number;

  // Marketplace
  abstract buy(params: any): Promise<string>;
  abstract sell(params: any): Promise<string>;
  abstract cancel(params: any): Promise<string>;

  // Auction
  abstract createAuction(params: any): Promise<string>;
  abstract cancelAuction(params: any): Promise<string>;
  abstract bidAuction(params: any): Promise<string>;
  abstract withdrawAuctionBid(params: any): Promise<string>;
  abstract buyNowAuction(params: any): Promise<string>;
  abstract settleAndDistributeAuctionProceeds(params: any): Promise<string>;

  // Edition Drop
  abstract commitMasterNft(params: any): Promise<string>;
  abstract mintNewPrint(params: any): Promise<string>;
  abstract redeemDrop(params: any): Promise<string>;
}
