import { EthWalletNftQuery } from '@liqnft/candy-shop-types';
import { fetchUserEthWalletNft } from './factory/backend';
import axiosInstance from './vendor/config';

export function fetchUserEthWalletNftByWalletAddress(walletAddress: string, query?: EthWalletNftQuery) {
  return fetchUserEthWalletNft(axiosInstance, walletAddress, query);
}
