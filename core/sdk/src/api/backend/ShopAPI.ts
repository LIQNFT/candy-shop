import { SingleBase, WhitelistNft, ShopStatus, CandyShop, ListBase } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';

export async function fetchShopWhitelistNftByShopId(
  axiosInstance: AxiosInstance,
  shopId: string
): Promise<ListBase<WhitelistNft>> {
  console.log('CandyShop: fetching shop whitelist nft');
  return axiosInstance.get<ListBase<WhitelistNft>>(`/shop/wlNfts/${shopId}`).then((response) => response.data);
}

export async function fetchShopByShopId(axiosInstance: AxiosInstance, shopId: string): Promise<SingleBase<CandyShop>> {
  return axiosInstance.get<SingleBase<CandyShop>>(`/shop/id/${shopId}`).then((response) => response.data);
}

export async function fetchShopStatusByShopId(
  axiosInstance: AxiosInstance,
  shopId: string,
  walletAddress?: string
): Promise<SingleBase<ShopStatus[]>> {
  return axiosInstance
    .get<SingleBase<ShopStatus[]>>(`/status/${shopId}?${walletAddress ? `walletAddress=${walletAddress}` : ''}`)
    .then((res) => res.data);
}
