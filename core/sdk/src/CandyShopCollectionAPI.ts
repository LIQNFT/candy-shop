import { ListBase, NftCollection, CollectionQuery } from '@liqnft/candy-shop-types';
import { fetchCollection, fetchCollectionByShopId } from './factory/backend';
import axiosInstance from './vendor/config';

export function fetchAllCollection(queryDto?: CollectionQuery): Promise<ListBase<NftCollection>> {
  return fetchCollection(axiosInstance, queryDto);
}

export function fetchCollectionByShopAddress(queryDto?: CollectionQuery): Promise<ListBase<NftCollection>> {
  return fetchCollectionByShopId(axiosInstance, queryDto);
}
