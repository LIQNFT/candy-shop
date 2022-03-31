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
  // handles pagination internally
  let limit = 10,
    offset = 0,
    resCount = null;
  let orders: Order[] = [];
  while (resCount === null || resCount == limit) {
    const page: Order[] = await axiosInstance
      .get<ListBase<Order>>(
        `/order/${storeId}?offset=${offset}&limit=${limit}&filterArr[]=${JSON.stringify(
          {
            side: 1,
            status: 0,
            walletAddress,
          }
        )}`
      )
      .then((response) => response.data?.result);
    resCount = page.length;
    offset = (offset + 1) * 10;
    orders.push(...page);
  }

  return orders;
}
