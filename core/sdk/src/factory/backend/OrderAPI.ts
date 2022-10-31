import {
  ListBase,
  Order,
  OrdersFilterQuery,
  OrdersEditionFilterQuery,
  Side,
  SingleBase,
  Status,
  Blockchain
} from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';

export async function fetchOrdersByStoreId(
  axiosInstance: AxiosInstance,
  storeId: string,
  ordersFilterQuery: OrdersFilterQuery
): Promise<ListBase<Order>> {
  const {
    sortBy,
    offset = 0,
    limit = 12,
    identifiers,
    sellerAddress,
    candyShopAddress,
    attribute,
    collectionId,
    nftName,
    masterEdition,
    collectionKey
  } = ordersFilterQuery;

  let blockchain = ordersFilterQuery.blockchain;
  if (
    ordersFilterQuery.blockchain === Blockchain.SolDevnet ||
    ordersFilterQuery.blockchain === Blockchain.SolMainnetBeta
  ) {
    blockchain = Blockchain.Sol;
  }

  let queryParams: any = { offset, limit, blockchain };

  if (sortBy) {
    const arrSortBy = Array.isArray(sortBy) ? sortBy : [sortBy];
    queryParams.orderByArr = arrSortBy.map((sort) => JSON.stringify(sort));
  }

  if (identifiers && identifiers.length !== 0) {
    queryParams['filterArr[]'] = identifiers.map((identifier) =>
      JSON.stringify({
        side: Side.SELL,
        status: Status.OPEN,
        identifier,
        walletAddress: sellerAddress,
        candyShopAddress,
        attribute,
        collectionId,
        nftName
      })
    );
  } else {
    queryParams['filterArr[]'] = JSON.stringify({
      side: Side.SELL,
      status: Status.OPEN,
      walletAddress: sellerAddress,
      candyShopAddress,
      attribute,
      collectionId,
      nftName
    });
  }

  if (masterEdition) {
    queryParams.masterEdition = true;
  }
  if (collectionKey) {
    queryParams.collectionKey = collectionKey;
  }

  console.log(`CandyShop: fetching orders from ${storeId}`, { query: ordersFilterQuery });
  const url = `/order/${storeId}?${qs.stringify(queryParams, { indices: false })}`;
  return axiosInstance.get<ListBase<Order>>(url).then((response) => response.data);
}

/**
 * @deprecated The method should not be used.
 * Please use function fetchOrderByTokenMintAndShopId below
 */
export async function fetchOrderByTokenMint(
  axiosInstance: AxiosInstance,
  mintAddress: string
): Promise<SingleBase<Order>> {
  const url = `/order/mint/${mintAddress}`;
  return axiosInstance.get<SingleBase<Order>>(url).then((response) => response.data);
}

export async function fetchOrderByTokenMintAndShopId(
  axiosInstance: AxiosInstance,
  mintAddress: string,
  shopId: string
): Promise<SingleBase<Order>> {
  console.log(`CandyShop: fetching orders by shop address=${shopId}, mintAddress=${mintAddress}`);
  const url = `/order/mint/${mintAddress}/shop/${shopId}`;
  return axiosInstance.get<SingleBase<Order>>(url).then((response) => response.data);
}

export async function fetchOrdersByStoreIdAndWalletAddress(
  axiosInstance: AxiosInstance,
  storeId: string,
  walletAddress: string
): Promise<Order[]> {
  console.log(`CandyShop: fetching orders by shop address=${storeId}, walletAddress=${walletAddress}`);
  // handles pagination internally
  const limit = 12;
  let offset = 0;
  let resCount: number | null = null;
  let orders: Order[] = [];

  while (resCount === null || resCount == limit) {
    const queryParams = {
      offset,
      limit,
      'filterArr[]': JSON.stringify({
        side: 1,
        status: 0,
        walletAddress
      })
    };
    const url = `/order/${storeId}?${qs.stringify(queryParams, { indices: false })}`;
    const page: Order[] = await axiosInstance.get<ListBase<Order>>(url).then((response) => response.data?.result);
    resCount = page.length;
    offset = offset + limit;
    orders = orders.concat(page);
  }

  return orders;
}

export async function fetchOrdersByStoreIdAndMasterEditionMint(
  axiosInstance: AxiosInstance,
  storeId: string,
  masterMint: string,
  ordersEditionFilterQuery: OrdersEditionFilterQuery
): Promise<ListBase<Order>> {
  const { offset = 0, limit = 10 } = ordersEditionFilterQuery;
  console.log(`CandyShop: fetching orders by shop address=${storeId}, masterMint=${masterMint}`);
  const url = `/order/edition/mint/${masterMint}/shop/${storeId}?`;
  return axiosInstance
    .get<ListBase<Order>>(url, {
      params: {
        offset,
        limit
      }
    })
    .then((response) => response.data);
}
