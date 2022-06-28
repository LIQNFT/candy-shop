import { NftCollection, ListBase, CollectionQuery } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';

export async function fetchCollection(
  axiosInstance: AxiosInstance,
  queryDto?: CollectionQuery
): Promise<ListBase<NftCollection>> {
  console.log('CandyShop: fetching NFT Collection, query=', queryDto);
  const { offset, limit = 10, name } = queryDto || {};
  let queryObj: any = {};
  if (offset !== undefined) {
    queryObj = { offset, limit };
  }
  if (name && typeof name === 'string') {
    queryObj.name = name;
  }
  const queryString = qs.stringify(queryObj);
  return await axiosInstance
    .get<ListBase<NftCollection>>(`/nftCollection?${queryString}`)
    .then((response) => response.data);
}

export async function fetchCollectionByShopId(
  axiosInstance: AxiosInstance,
  queryDto?: CollectionQuery
): Promise<ListBase<NftCollection>> {
  const { shopId, offset, limit = 10, name } = queryDto || {};
  let queryObj: any = {};
  if (offset !== undefined) {
    queryObj = { offset, limit };
  }
  if (name && typeof name === 'string') {
    queryObj.name = name;
  }
  const queryString = qs.stringify(queryObj);

  console.log('CandyShop: fetching NFT Collection by ShopId', queryDto);
  return await axiosInstance
    .get<ListBase<NftCollection>>(`/nftCollection/${shopId}?${queryString}`)
    .then((response) => response.data);
}
