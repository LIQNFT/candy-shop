import { NftStats, ShopStats, SingleBase } from 'solana-candy-shop-schema/dist';
import axiosInstance from '../../config/axiosInstance';

export async function fetchStatsById(storeId: string): Promise<ShopStats> {
  return axiosInstance
    .get<SingleBase<ShopStats>>(`/stats/${storeId}`)
    .then((response) => response.data.result);
}

export async function fetchStatsMintById(
  storeId: string,
  mint: string
): Promise<NftStats> {
  return await axiosInstance
    .get<SingleBase<NftStats>>(`/stats/${storeId}/${mint}`)
    .then((response) => response.data.result);
}
