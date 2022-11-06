import { BaseShop, fetchOrdersByShopAndWalletAddress, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { Order, Auction, CandyShop as CandyShopResponse, SingleBase, Nft } from '@liqnft/candy-shop-types';

export interface SolSellerOptions {
  shopAddress: string;
  candyShopProgramId?: string;
  baseUnitsPerCurrency: number;
  shopTreasuryMint: string;
  shopCreatorAddress: string;
}

export abstract class Store {
  protected baseShop: BaseShop;

  constructor(shop: BaseShop) {
    this.baseShop = shop;
  }

  /* Shared methods with same implementation */
  public getOrderNfts(walletAddress: string): Promise<Order[]> {
    return fetchOrdersByShopAndWalletAddress(this.baseShop.candyShopAddress, walletAddress);
  }

  /* Required common shop data methods */
  abstract getShop(): Promise<CandyShopResponse>;
  abstract getNFTs(
    walletPublicKey: string,
    options: { enableCacheNFT?: boolean; allowSellAnyNft?: number; candyShopAddress: string }
  ): Promise<SingleTokenInfo[]>;
  abstract getOrderNft(tokenMint: string): Promise<SingleBase<Order>>;
  abstract getNftInfo(tokenMint: string): Promise<Nft>;

  /* Required common trading methods */
  abstract buy(order: Order): Promise<string>;
  abstract sell(nft: SingleTokenInfo, price: number, options?: SolSellerOptions): Promise<string>;
  abstract cancel(order: Order): Promise<any>;
}

export interface Auctionner {
  createAuction(params: unknown): Promise<string>;
  buyNowAuction(auction: Auction): Promise<string>;
  bidAuction(auction: Auction, price: number): Promise<string>;
  withdrawAuctionBid(auction: Auction): Promise<string>;
}
