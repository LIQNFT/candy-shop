import { Auction, AuctionBid, ListBase, SingleBase } from '@liqnft/candy-shop-types';
import { AuctionQuery, fetchAuctionBid, fetchAuctionsByShop } from './factory/backend';
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
