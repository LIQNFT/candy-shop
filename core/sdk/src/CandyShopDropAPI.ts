import { ListBase, Drop, DropQuery, DropActivityQuery, DropActivity } from '@liqnft/candy-shop-types';
import { fetchDropActivities, fetchDropsByStoreId, registerDrop, registerRedemption } from './factory/backend';
import { RegisterDropParams, RegisterRedemptionParams } from './shop';
import axiosInstance from './vendor/config';

export function fetchDropsByShopAddress(shopId: string, dropQuery?: DropQuery): Promise<ListBase<Drop>> {
  return fetchDropsByStoreId(axiosInstance, shopId, dropQuery);
}
export function fetchDropActivitiesByWalletAddress(
  dropActivityQuery: DropActivityQuery
): Promise<ListBase<DropActivity>> {
  return fetchDropActivities(axiosInstance, dropActivityQuery);
}
export function registerDropRedemption(registerDropRedemptionData: RegisterRedemptionParams) {
  return registerRedemption(axiosInstance, registerDropRedemptionData);
}
export function registerDropWithRedemption(registerDropData: RegisterDropParams) {
  return registerDrop(axiosInstance, registerDropData);
}
