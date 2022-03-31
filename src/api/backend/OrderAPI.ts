import { ListBase, Order } from 'solana-candy-shop-schema/dist';
import axiosInstance from '../../config/axiosInstance';

export async function fetchOrdersByStoreId(
  storeId: string
): Promise<ListBase<Order>> {
  return axiosInstance
    .get<ListBase<Order>>(`/order/${storeId}`)
    .then((response) => response.data);
}

export async function fetchOrdersByStoreIdAndWalletAddress(
  storeId: string,
  walletAddress: string
): Promise<Order[]> {
  return axiosInstance
    .get<ListBase<Order>>(
      `/order/${storeId}?filterArr[]=${JSON.stringify({
        side: 1,
        status: 0,
        walletAddress,
      })}`
    )
    .then((response) => response.data?.result);
}
