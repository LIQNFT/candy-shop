import { WhitelistNft } from 'solana-candy-shop-schema/dist';
import {
  ListBase,
  CandyShop,
} from 'solana-candy-shop-schema/src/response/index';

import axiosInstance from '../../config/axiosInstance';

export async function fetchShopByWalletAddress(
  walletAddress: string
): Promise<ListBase<CandyShop>> {
  return axiosInstance
    .get<ListBase<CandyShop>>(`/shop/${walletAddress}`)
    .then((response) => response.data);
}

export async function fetchShopWhitelistNftByShopId(
  shopId: string
): Promise<ListBase<WhitelistNft>> {
  return axiosInstance
    .get<ListBase<WhitelistNft>>(`/shop/wlNfts/${shopId}`)
    .then((response) => response.data);
}

export async function addShopWhitelistNft(
  shopId: string,
  body: {
    signature: string;
    message: string;
    publicKey: string;
  }
): Promise<WhitelistNft> {
  return axiosInstance.post(`/wlNfts/${shopId}`, body);
}

export async function deleteShopWhitelistNft(
  shopId: string,
  body: { signature: string; message: string; publicKey: string }
): Promise<WhitelistNft> {
  return axiosInstance.delete(`/wlNfts/${shopId}`, { data: body });
}
