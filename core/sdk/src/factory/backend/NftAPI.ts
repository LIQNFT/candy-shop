import { SingleBase, Nft, EthWalletNftQuery, ListBaseWithCursor } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';

export async function fetchNftByMint(axiosInstance: AxiosInstance, mint: string): Promise<Nft> {
  console.log('CandyShop: fetching NFT by mint address=', mint);
  return await axiosInstance.get<SingleBase<Nft>>(`/nft/${mint}`).then((response) => response.data.result);
}

export async function fetchUserEthWalletNft(
  axiosInstance: AxiosInstance,
  walletAddress: string,
  query?: EthWalletNftQuery
): Promise<ListBaseWithCursor<Nft>> {
  console.log(`CandyShop: fetchUserEthWalletNft by wallet address=${walletAddress} with query`, query);
  return await axiosInstance
    .get<ListBaseWithCursor<Nft>>(`/nft/eth-wallet/:${walletAddress}`, {
      params: query
    })
    .then((response) => response.data);
}
