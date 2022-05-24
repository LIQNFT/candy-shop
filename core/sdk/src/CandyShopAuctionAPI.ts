import axiosInstance from './config';
import { fetchAuctionsByShop } from './api/backend';
import { Auction, ListBase } from '@liqnft/candy-shop-types';

export function fetchAuctionsByShopAddress(shopId: string): Promise<ListBase<Auction>> {
  return fetchAuctionsByShop(axiosInstance, shopId);
}
