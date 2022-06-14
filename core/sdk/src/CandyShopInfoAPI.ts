/**
 * CandyShopInfoAPI provides a gateway for callers to interact with CandyShop APIs without going through
 * CandyShop instance but just a few required fields from CandyShop instance to get the shop info.
 */

import { web3 } from '@project-serum/anchor';
import {
  ListBase,
  Nft,
  Order,
  ShopStats,
  SingleBase,
  Trade,
  WhitelistNft,
  CandyShop as CandyShopResponse,
  ShopStatus,
  ShopStatusQuery
} from '@liqnft/candy-shop-types';
import {
  fetchNftByMint,
  fetchOrderByTokenMintAndShopId,
  fetchOrdersByStoreId,
  fetchOrdersByStoreIdAndWalletAddress,
  fetchShopByShopId,
  fetchShopWhitelistNftByShopId,
  fetchStatsById,
  fetchTradeById,
  OrdersFilterQuery,
  TradeQuery,
  fetchShopStatusByShopId
} from './api/backend';
import axiosInstance from './config';

export function fetchStatsByShopAddress(candyShopAddress: web3.PublicKey): Promise<ShopStats> {
  return fetchStatsById(axiosInstance, candyShopAddress.toString());
}

export function fetchTradeByShopAddress(
  candyShopAddress: web3.PublicKey,
  queryDto: TradeQuery
): Promise<ListBase<Trade>> {
  return fetchTradeById(axiosInstance, candyShopAddress.toString(), queryDto);
}

export function fetchNFTByMintAddress(mintAddressStr: string): Promise<Nft> {
  return fetchNftByMint(axiosInstance, mintAddressStr);
}

export function fetchOrdersByShopAddress(
  candyShopAddress: web3.PublicKey,
  ordersFilterQuery: OrdersFilterQuery
): Promise<ListBase<Order>> {
  return fetchOrdersByStoreId(axiosInstance, candyShopAddress.toString(), ordersFilterQuery);
}

export function fetchOrdersByShopAndWalletAddress(
  candyShopAddress: web3.PublicKey,
  walletAddressStr: string
): Promise<Order[]> {
  return fetchOrdersByStoreIdAndWalletAddress(axiosInstance, candyShopAddress.toString(), walletAddressStr);
}

export function fetchShopWhitelistNftByShopAddress(candyShopAddress: web3.PublicKey): Promise<ListBase<WhitelistNft>> {
  return fetchShopWhitelistNftByShopId(axiosInstance, candyShopAddress.toString());
}

export function fetchOrderByShopAndMintAddress(
  candyShopAddress: web3.PublicKey,
  mintAddressStr: string
): Promise<SingleBase<Order>> {
  return fetchOrderByTokenMintAndShopId(axiosInstance, mintAddressStr, candyShopAddress.toString());
}

export function fetchShopByShopAddress(candyShopAddress: web3.PublicKey): Promise<SingleBase<CandyShopResponse>> {
  return fetchShopByShopId(axiosInstance, candyShopAddress.toString());
}

export function fetchShopStatusByShopAddress(
  candyShopAddress: web3.PublicKey,
  query: ShopStatusQuery
): Promise<SingleBase<ShopStatus[]>> {
  return fetchShopStatusByShopId(axiosInstance, candyShopAddress.toString(), query);
}
