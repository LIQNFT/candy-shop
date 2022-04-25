import { SingleBase, WhitelistNft } from 'solana-candy-shop-schema/dist';
import { ListBase, CandyShop } from 'solana-candy-shop-schema/src/response';

import { AxiosInstance } from 'axios';

export async function fetchShopWhitelistNftByShopId(
  axiosInstance: AxiosInstance,
  shopId: string
): Promise<ListBase<WhitelistNft>> {
  return axiosInstance
    .get<ListBase<WhitelistNft>>(`/shop/wlNfts/${shopId}`)
    .then((response) => response.data);
}

export async function fetchShopByShopId(
  axiosInstance: AxiosInstance,
  shopId: string
): Promise<SingleBase<CandyShop>> {
  return axiosInstance
    .get<SingleBase<CandyShop>>(`/shop/id/${shopId}`)
    .then((response) => response.data);
}
