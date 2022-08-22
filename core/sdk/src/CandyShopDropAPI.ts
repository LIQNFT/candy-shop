import { ListBase, Drop, DropQuery, DropActivityQuery, DropActivity } from '@liqnft/candy-shop-types';
import { fetchDropActivities, fetchDropsByStoreId } from './factory/backend';
import axiosInstance from './vendor/config';

export function fetchDropsByShopAddress(shopId: string, dropQuery?: DropQuery): Promise<ListBase<Drop>> {
  return fetchDropsByStoreId(axiosInstance, shopId, dropQuery);
}
export function fetchDropActivitiesByWalletAddress(
  dropActivityQuery: DropActivityQuery
): Promise<ListBase<DropActivity>> {
  return fetchDropActivities(axiosInstance, dropActivityQuery);
}
