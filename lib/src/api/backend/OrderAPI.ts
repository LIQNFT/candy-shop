import { ListBase, Order, SingleBase } from 'solana-candy-shop-schema/dist';
import axiosInstance from '../../config/axiosInstance';
import qs from 'qs';

export type SortBy = {
  column: string;
  order: 'asc' | 'desc';
};

export type OrdersFilterQuery = {
  sortBy?: SortBy,
  offset?: number,
  limit?: number
}

export async function fetchOrdersByStoreId(
  storeId: string,
  ordersFilterQuery: OrdersFilterQuery
): Promise<ListBase<Order>> {
  const { sortBy, offset, limit } = ordersFilterQuery;

  const queryObject = {} as any;
  if (sortBy) {
    queryObject['orderByArr'] = JSON.stringify(sortBy);
  }
  if (offset) {
    queryObject['offset'] = offset;
  }
  if (limit) {
    queryObject['limit'] = limit;
  }

  const queryString = qs.stringify(queryObject);

  return axiosInstance
    .get<ListBase<Order>>(`/order/${storeId}?${queryString}`)
    .then((response) => response.data);
}

export async function fetchOrderByTokenMint(
  mintAddress: string
): Promise<SingleBase<Order>> {
  return axiosInstance
    .get<SingleBase<Order>>(`/order/mint/${mintAddress}`)
    .then((response) => response.data);
}

export async function fetchOrdersByStoreIdAndWalletAddress(
  storeId: string,
  walletAddress: string
): Promise<Order[]> {
  // handles pagination internally
  const limit = 10;
  let offset = 0,
    resCount = null;
  const orders: Order[] = [];
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
