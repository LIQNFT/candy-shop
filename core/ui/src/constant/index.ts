import { ShopStatusType } from '@liqnft/candy-shop-types';

export enum LoadStatus {
  ToLoad = 'ToLoad',
  Loading = 'Loading',
  Loaded = 'Loaded'
}
export const TIMEOUT_EXTRA_LOADING = 3_000;
export const POLLING_SHOP_INTERVAL = 3_000;
export const POLLING_INTERVAL = POLLING_SHOP_INTERVAL + 500;

export const StatActionsStatus = [ShopStatusType.Order];
export const OrdersActionsStatus = [ShopStatusType.Order];
export const SellActionsStatus = [ShopStatusType.Order];
export const ActivityActionsStatus = [ShopStatusType.Trade];
