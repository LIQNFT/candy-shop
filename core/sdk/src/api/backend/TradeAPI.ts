import { ListBase, Trade } from 'solana-candy-shop-schema/dist';
import { AxiosInstance } from 'axios';

export async function fetchTradeById(axiosInstance: AxiosInstance, storeId: string): Promise<Trade[]> {
  return axiosInstance.get<ListBase<Trade>>(`/trade/${storeId}`).then((response) => response.data.result);
}
