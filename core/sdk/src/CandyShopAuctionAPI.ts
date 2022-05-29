import { Auction, AuctionBid, ListBase, SingleBase } from '@liqnft/candy-shop-types';
import { AuctionQuery, fetchAuctionBid, fetchAuctionsByShop } from './api/backend';
import axiosInstance from './config';

export function fetchAuctionsByShopAddress(shopId: string, queryDto?: AuctionQuery): Promise<ListBase<Auction>> {
  return fetchAuctionsByShop(axiosInstance, shopId, queryDto);
}

export function fetchAuctionBidByWalletAddress(
  auctionAddress: string,
  walletAddress: string
): Promise<SingleBase<AuctionBid>> {
  return fetchAuctionBid(axiosInstance, auctionAddress, walletAddress);
}
