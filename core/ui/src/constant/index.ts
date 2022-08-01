import { AuctionStatus, ShopStatusType } from '@liqnft/candy-shop-types';

export enum LoadStatus {
  ToLoad = 'ToLoad',
  Loading = 'Loading',
  Loaded = 'Loaded'
}
export const TIMEOUT_EXTRA_LOADING = 3_000;
export const POLLING_SHOP_INTERVAL = 3_000;
export const POLLING_INTERVAL = 1000;

export const StatActionsStatus = [ShopStatusType.Order];
export const OrdersActionsStatus = [ShopStatusType.Order];
export const SellActionsStatus = [ShopStatusType.UserNft];
export const ActivityActionsStatus = [ShopStatusType.Trade];
export const AuctionActionsStatus = [ShopStatusType.Auction];

export const DEFAULT_LIST_AUCTION_STATUS = [
  AuctionStatus.CREATED,
  AuctionStatus.STARTED,
  AuctionStatus.EXPIRED,
  AuctionStatus.COMPLETE
];
