import { Auction, AuctionBid, AuctionBidQuery, ListBase, SingleBase, AuctionQuery } from '@liqnft/candy-shop-types';
import { fetchAuctionBid, fetchAuctionHistoryByAddress, fetchAuctionsByShop } from './factory/backend';
import axiosInstance from './vendor/config';

export function fetchAuctionsByShopAddress(shopId: string, queryDto?: AuctionQuery): Promise<ListBase<Auction>> {
  return fetchAuctionsByShop(axiosInstance, shopId, queryDto);
}

export function fetchAuctionBidByWalletAddress(
  auctionAddress: string,
  walletAddress: string
): Promise<SingleBase<AuctionBid>> {
  return fetchAuctionBid(axiosInstance, auctionAddress, walletAddress);
}

export function fetchAuctionHistory(
  auctionAddress: string,
  auctionBidQuery?: AuctionBidQuery
): Promise<ListBase<AuctionBid>> {
  return fetchAuctionHistoryByAddress(axiosInstance, auctionAddress, auctionBidQuery);
}
