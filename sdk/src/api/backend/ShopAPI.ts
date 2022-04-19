import { WhitelistNft } from 'solana-candy-shop-schema/dist';
import {
  ListBase,
  CandyShop
} from 'solana-candy-shop-schema/src/response/index';

import { AxiosInstance } from 'axios';

export async function fetchShopByWalletAddress(
  axiosInstance: AxiosInstance,
  walletAddress: string
): Promise<ListBase<CandyShop>> {
  return axiosInstance
    .get<ListBase<CandyShop>>(`/shop/${walletAddress}`)
    .then((response) => response.data);
}

export async function fetchShopWhitelistNftByShopId(
  axiosInstance: AxiosInstance,
  shopId: string
): Promise<ListBase<WhitelistNft>> {
  return axiosInstance
    .get<ListBase<WhitelistNft>>(`/shop/wlNfts/${shopId}`)
    .then((response) => response.data);
}
