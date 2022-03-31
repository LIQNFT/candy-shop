import { ListBase, Trade } from 'solana-candy-shop-schema/dist';
import axiosInstance from '../../config/axiosInstance';

export async function fetchTradeById(storeId: string): Promise<Trade[]> {
  return axiosInstance
    .get<ListBase<Trade>>(`/trade/${storeId}`)
    .then((response) => response.data.result);
}
