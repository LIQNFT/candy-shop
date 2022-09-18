import { SingleBase, Nft, EthWalletNftQuery, ListBaseWithCursor } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';

export async function fetchNftByMint(axiosInstance: AxiosInstance, mint: string): Promise<Nft> {
  console.log('CandyShop: fetching NFT by mint address=', mint);
  const url = `/nft/${mint}`;
  return await axiosInstance.get<SingleBase<Nft>>(url).then((response) => response.data.result);
}

export async function fetchEthNftsFromWallet(
  axiosInstance: AxiosInstance,
  walletAddress: string,
  query?: EthWalletNftQuery
): Promise<ListBaseWithCursor<Nft>> {
  console.log(`CandyShop: fetchUserEthWalletNft by wallet address=${walletAddress} with query`, query);
  const url = `/nft/eth-wallet/:${walletAddress}`;
  return await axiosInstance
    .get<ListBaseWithCursor<Nft>>(url, {
      params: query
    })
    .then((response) => response.data);
}
