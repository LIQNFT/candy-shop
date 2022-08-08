import { ListBase, Drop, DropQuery } from '@liqnft/candy-shop-types';
import { fetchDropsByStoreId } from './factory/backend';
import axiosInstance from './vendor/config';

export function fetchDropsByShopAddress(shopId: string, queryDto?: DropQuery): Promise<ListBase<Drop>> {
  return fetchDropsByStoreId(axiosInstance, shopId, queryDto);
}
