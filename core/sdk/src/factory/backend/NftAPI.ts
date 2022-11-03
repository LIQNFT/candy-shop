import { SingleBase, Nft, FetchEvmWalletNftQuery, ListBaseWithCursor } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import { SingleTokenInfo } from '../../vendor';

export async function fetchNftByMint(axiosInstance: AxiosInstance, mint: string): Promise<Nft> {
  const url = `/nft/${mint}`;
  return await axiosInstance.get<SingleBase<Nft>>(url).then((response) => response.data.result);
}

export async function fetchEvmChainNftsFromWallet(
  axiosInstance: AxiosInstance,
  walletAddress: string,
  shopId: string,
  query?: FetchEvmWalletNftQuery
): Promise<ListBaseWithCursor<SingleTokenInfo>> {
  const url = `/nft/eth-wallet/${walletAddress}/shopId/${shopId}`;
  return await axiosInstance
    .get<ListBaseWithCursor<SingleTokenInfo>>(url, {
      params: query
    })
    .then((response) => response.data);
}
