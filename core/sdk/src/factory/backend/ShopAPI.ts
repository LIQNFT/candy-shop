import {
  SingleBase,
  WhitelistNft,
  ShopStatus,
  CandyShop,
  ListBase,
  ShopStatusQuery,
  ShopQuery
} from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';

export async function fetchShopWhitelistNftByShopId(
  axiosInstance: AxiosInstance,
  shopId: string
): Promise<ListBase<WhitelistNft>> {
  console.log('CandyShop: fetching shop whitelist nft');
  const url = `/shop/wlNfts/${shopId}`;
  return axiosInstance.get<ListBase<WhitelistNft>>(url).then((response) => response.data);
}

export async function fetchShopByShopId(axiosInstance: AxiosInstance, shopId: string): Promise<SingleBase<CandyShop>> {
  const url = `/shop/id/${shopId}`;
  return axiosInstance.get<SingleBase<CandyShop>>(url).then((response) => response.data);
}

export async function fetchShop(axiosInstance: AxiosInstance, queryDto?: ShopQuery): Promise<ListBase<CandyShop>> {
  const { offset, limit = 10 } = queryDto || {};
  let queryObject: any = {};
  if (offset) {
    queryObject = { offset, limit };
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
