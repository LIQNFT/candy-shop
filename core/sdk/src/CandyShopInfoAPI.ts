/**
 * CandyShopInfoAPI provides a gateway for callers to interact with CandyShop APIs without going through
 * CandyShop instance but just a few required fields from CandyShop instance to get the shop info.
 */

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
  ShopStatusQuery,
  OrdersFilterQuery,
  TradeQuery,
  ShopQuery,
  CollectionQuery,
  NftCollection,
  OrdersEditionFilterQuery,
  Blockchain
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
  fetchShopStatusByShopId,
  fetchShop,
  fetchCollection,
  fetchCollectionByShopId,
  fetchOrdersByStoreIdAndMasterEditionMint,
  fetchShopByOwnerAddress,
  fetchShopByIdentifier
} from './factory/backend';
import axiosInstance from './vendor/config';

export function fetchStatsByShopAddress(candyShopAddress: string): Promise<ShopStats> {
  return fetchStatsById(axiosInstance, candyShopAddress);
}

export function fetchTradeByShopAddress(candyShopAddress: string, queryDto: TradeQuery): Promise<ListBase<Trade>> {
  return fetchTradeById(axiosInstance, candyShopAddress, queryDto);
}

export function fetchNFTByMintAddress(mintAddressStr: string): Promise<Nft> {
  return fetchNftByMint(axiosInstance, mintAddressStr);
}

export function fetchOrdersByShopAddress(
  candyShopAddress: string,
  ordersFilterQuery: OrdersFilterQuery
): Promise<ListBase<Order>> {
  return fetchOrdersByStoreId(axiosInstance, candyShopAddress, ordersFilterQuery);
}

export function fetchOrdersByShopAndWalletAddress(
  candyShopAddress: string,
  walletAddressStr: string
): Promise<Order[]> {
  return fetchOrdersByStoreIdAndWalletAddress(axiosInstance, candyShopAddress, walletAddressStr);
}

export function fetchOrdersByShopAndMasterEditionMint(
  candyShopAddress: string,
  masterMint: string,
  ordersEditionFilterQuery: OrdersEditionFilterQuery
): Promise<ListBase<Order>> {
  return fetchOrdersByStoreIdAndMasterEditionMint(
    axiosInstance,
    candyShopAddress,
    masterMint,
    ordersEditionFilterQuery
  );
}

export function fetchShopWhitelistNftByShopAddress(candyShopAddress: string): Promise<ListBase<WhitelistNft>> {
  return fetchShopWhitelistNftByShopId(axiosInstance, candyShopAddress);
}

export function fetchShopsByOwnerAddress(ownerAddress: string): Promise<ListBase<CandyShopResponse>> {
  return fetchShopByOwnerAddress(axiosInstance, ownerAddress);
}

export function fetchShopsByIdentifier(
  ownerAddress: string,
  treasuryMint: string,
  programId: string,
  blockchain: Blockchain
): Promise<SingleBase<CandyShopResponse>> {
  return fetchShopByIdentifier(axiosInstance, ownerAddress, treasuryMint, programId, blockchain);
}

export function fetchOrderByShopAndMintAddress(
  candyShopAddress: string,
  mintAddressStr: string
): Promise<SingleBase<Order>> {
  return fetchOrderByTokenMintAndShopId(axiosInstance, mintAddressStr, candyShopAddress);
}

export function fetchShopByShopAddress(candyShopAddress: string): Promise<SingleBase<CandyShopResponse>> {
  return fetchShopByShopId(axiosInstance, candyShopAddress);
}

export function fetchShopStatusByShopAddress(
  candyShopAddress: string,
  query: ShopStatusQuery
): Promise<SingleBase<ShopStatus[]>> {
  return fetchShopStatusByShopId(axiosInstance, candyShopAddress, query);
}

export function fetchAllShop(allShopQuery?: ShopQuery): Promise<ListBase<CandyShopResponse>> {
  return fetchShop(axiosInstance, allShopQuery);
}

export function fetchAllCollection(allCollectionQuery?: CollectionQuery): Promise<ListBase<NftCollection>> {
  return fetchCollection(axiosInstance, allCollectionQuery);
}

export function fetchCollectionByShopAddress(
  collectionByShopQuery?: CollectionQuery
): Promise<ListBase<NftCollection>> {
  return fetchCollectionByShopId(axiosInstance, collectionByShopQuery);
}
