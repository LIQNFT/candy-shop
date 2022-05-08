import { NftStats, ShopStats, SingleBase } from 'solana-candy-shop-schema/dist';
import { AxiosInstance } from 'axios';

export async function fetchStatsById(axiosInstance: AxiosInstance, storeId: string): Promise<ShopStats> {
  console.log('CandyShop: fetching Stats');
  return axiosInstance.get<SingleBase<ShopStats>>(`/stats/${storeId}`).then((response) => response.data.result);
}

export async function fetchStatsMintById(
  axiosInstance: AxiosInstance,
  storeId: string,
  mint: string
): Promise<NftStats> {
  return await axiosInstance
    .get<SingleBase<NftStats>>(`/stats/${storeId}/${mint}`)
    .then((response) => response.data.result);
}
