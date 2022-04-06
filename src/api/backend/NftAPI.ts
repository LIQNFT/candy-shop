import { SingleBase, Nft } from 'solana-candy-shop-schema/dist';
import axiosInstance from '../../config/axiosInstance';

export async function fetchNftByMint(mint: string): Promise<Nft> {
  return await axiosInstance
    .get<SingleBase<Nft>>(`/nft/${mint}`)
    .then((response) => response.data.result);
}
