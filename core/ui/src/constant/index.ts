import { ShopStatusType } from 'solana-candy-shop-schema';

export enum LoadStatus {
  ToLoad = 'ToLoad',
  Loading = 'Loading',
  Loaded = 'Loaded'
}
export const TIMEOUT_EXTRA_LOADING = 3_000;
export const POLLING_SHOP_TIMEOUT = 3_000;
export const POLLING_TIMEOUT = POLLING_SHOP_TIMEOUT + 500;

export const StatActionsStatus = [ShopStatusType.Order];
export const OrdersActionsStatus = [ShopStatusType.Order];
export const SellActionsStatus = [ShopStatusType.Order];
export const ActivityActionsStatus = [ShopStatusType.Trade];
