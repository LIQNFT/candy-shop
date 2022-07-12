import {
  SingleBase,
  WhitelistNft,
  ShopStatus,
  CandyShop,
  ListBase,
  ShopStatusQuery,
  ShopQuery,
  NftCollection,
  CollectionQuery
} from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';
import { FETCH_LIST_LIMIT } from '../constants';

const Logger = 'CandyShopSDK/ShopAPI';

export async function fetchShopWhitelistNftByShopId(
  axiosInstance: AxiosInstance,
  shopId: string
): Promise<ListBase<WhitelistNft>> {
  console.log(`${Logger}: fetching shop whitelist nft`);
  const url = `/shop/wlNfts/${shopId}`;
  return axiosInstance.get<ListBase<WhitelistNft>>(url).then((response) => response.data);
}

export async function fetchShopByShopId(axiosInstance: AxiosInstance, shopId: string): Promise<SingleBase<CandyShop>> {
  const url = `/shop/id/${shopId}`;
  return axiosInstance.get<SingleBase<CandyShop>>(url).then((response) => response.data);
}

export async function fetchShop(axiosInstance: AxiosInstance, shopQuery?: ShopQuery): Promise<ListBase<CandyShop>> {
  console.log(`${Logger}: fetching shop, query=`, shopQuery);
  const { offset, limit = FETCH_LIST_LIMIT, name } = shopQuery || {};
  let queryObject: any = {};
  if (offset) {
    queryObject = { offset, limit };
  }
  if (name && typeof name === 'string') {
    queryObject.name = name;
  }

  const queryString = qs.stringify(queryObject);
  const url = `/shop?${queryString}`;
  return axiosInstance.get<ListBase<CandyShop>>(url).then((res) => res.data);
}

export async function fetchShopStatusByShopId(
  axiosInstance: AxiosInstance,
  shopId: string,
  query: ShopStatusQuery
): Promise<SingleBase<ShopStatus[]>> {
  const { targets, walletAddress } = query;
  const queryString = qs.stringify({ walletAddress, targets }, { indices: false });
  const url = `/status/${shopId}?${queryString}`;
  return axiosInstance.get<SingleBase<ShopStatus[]>>(url).then((res) => res.data);
}

export async function fetchCollection(
  axiosInstance: AxiosInstance,
  collectionQuery?: CollectionQuery
): Promise<ListBase<NftCollection>> {
  console.log(`${Logger}: fetching NFT Collection, query=`, collectionQuery);
  const { offset, limit = FETCH_LIST_LIMIT, name } = collectionQuery || {};
  let queryObject: any = {};
  if (offset !== undefined) {
    queryObject = { offset, limit };
  }
  if (name && typeof name === 'string') {
    queryObject.name = name;
  }
  const queryString = qs.stringify(queryObject);
  return await axiosInstance
    .get<ListBase<NftCollection>>(`/nftCollection?${queryString}`)
    .then((response) => response.data);
}

export async function fetchCollectionByShopId(
  axiosInstance: AxiosInstance,
  collectionQuery?: CollectionQuery
): Promise<ListBase<NftCollection>> {
  const { shopId, offset, limit = FETCH_LIST_LIMIT, name } = collectionQuery || {};
  let queryObject: any = {};
  if (offset !== undefined) {
    queryObject = { offset, limit };
  }
  if (name && typeof name === 'string') {
    queryObject.name = name;
  }
  const queryString = qs.stringify(queryObject);

  console.log(`${Logger}: fetching NFT Collection by ShopId`, collectionQuery);
  return await axiosInstance
    .get<ListBase<NftCollection>>(`/nftCollection/${shopId}?${queryString}`)
    .then((response) => response.data);
}
