import { SingleBase, WhitelistNft, ShopStatus } from 'solana-candy-shop-schema/dist';
import { ListBase, CandyShop } from 'solana-candy-shop-schema/src/response';
import { AxiosInstance } from 'axios';

export function fetchShopWhitelistNftByShopId(
  axiosInstance: AxiosInstance,
  shopId: string
): Promise<ListBase<WhitelistNft>> {
  console.log('CandyShop: fetching shop whitelist nft');
  return axiosInstance.get<ListBase<WhitelistNft>>(`/shop/wlNfts/${shopId}`).then((response) => response.data);
}

export function fetchShopByShopId(axiosInstance: AxiosInstance, shopId: string): Promise<SingleBase<CandyShop>> {
  return axiosInstance.get<SingleBase<CandyShop>>(`/shop/id/${shopId}`).then((response) => response.data);
}

export function fetchShopByCreatorId(
  axiosInstance: AxiosInstance,
  creatorId: string
): Promise<SingleBase<CandyShop[]>> {
  return axiosInstance.get<SingleBase<CandyShop[]>>(`/shop/${creatorId}`).then((response) => response.data);
}

export function fetchShopStatusByShopId(
  axiosInstance: AxiosInstance,
  shopId: string
): Promise<SingleBase<ShopStatus[]>> {
  return axiosInstance.get<SingleBase<ShopStatus[]>>(`/status/${shopId}`).then((res) => res.data);
}
