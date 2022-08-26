import {
  Blockchain,
  CandyShop,
  ListBase,
  Nft,
  OrdersEditionFilterQuery,
  OrdersFilterQuery,
  SingleBase,
  Trade,
  TradeQuery,
  WhitelistNft
} from '@liqnft/candy-shop-types';
import { Order } from '@opensea/seaport-js/lib/types';
import { BlockchainType, CandyShopVersion, ExplorerLinkBase, ShopSettings } from './BaseShopModel';

export abstract class BaseShop {
  constructor(params: any) {}

  // Properties
  abstract get candyShopAddress(): string;
  abstract get candyShopCreatorAddress(): string;
  abstract get treasuryMint(): string;
  abstract get settings(): Partial<ShopSettings>;
  abstract get blockchain(): BlockchainType;
  abstract get baseUnitsPerCurrency(): number;
  abstract get currencySymbol(): string;
  abstract get currencyDecimals(): number;
  abstract get priceDecimalsMin(): number;
  abstract get priceDecimals(): number;
  abstract get volumeDecimals(): number;
  abstract get volumeDecimalsMin(): number;
  abstract get programId(): string | undefined;
  abstract get env(): Blockchain;
  abstract get version(): CandyShopVersion;
  abstract get explorerLink(): ExplorerLinkBase;
  abstract get connection(): any;
  abstract get isEnterprise(): boolean;

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

  abstract verifyProgramId(programId: any): void;
  abstract getStaticProgram(wallet: any): any;
  abstract updateCandyShop(params: any): Promise<string>;
  abstract stats(): any;
  abstract transactions(queryDto: TradeQuery): Promise<ListBase<Trade>>;
  abstract nftInfo(mint: string): Promise<Nft>;
  abstract orders(ordersFilterQuery: any): any;
  abstract childEditionOrders(masterMint: string, ordersEditionFilterQuery: OrdersEditionFilterQuery): any;
  abstract activeOrdersByWalletAddress(walletAddress: string): any;
  abstract shopWlNfts(): any;
  abstract activeOrderByMintAddress(mintAddress: string): any;
  abstract fetchShopByShopId(): any;
}
