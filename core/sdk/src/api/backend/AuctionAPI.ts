import { SingleBase, ListBase, Auction, AuctionBid } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';

export function fetchAuctionsByShop(axiosInstance: AxiosInstance, shopId: string): Promise<ListBase<Auction>> {
  console.log('fetching Auctions By ShopId=', shopId);
  return axiosInstance.get<ListBase<Auction>>(`/auction/${shopId}`).then((response) => response.data);
}

export function fetchAuctionBid(
  axiosInstance: AxiosInstance,
  auctionAddress: string,
  walletAddress: string
): Promise<SingleBase<AuctionBid>> {
  console.log(`fetching Auction bid by auctionAddress=${auctionAddress}, walletAddress=${walletAddress}`);
  return axiosInstance.get(`/auction/${auctionAddress}/wallet/${walletAddress}`).then((res) => res.data);
}

export function fetchAuction(axiosInstance: AxiosInstance, auctionAddress: string): Promise<SingleBase<Auction>> {
  console.log(`fetching Auction detail, auctionAddress=${auctionAddress}`);
  return axiosInstance.get(`/auction/${auctionAddress}`).then((res) => res.data);
}

export function fetchAuctionHistoryByAddress(
  axiosInstance: AxiosInstance,
  auctionAddress: string
): Promise<ListBase<AuctionBid>> {
  console.log(`fetching Auction bid history by auctionAddress=`, auctionAddress);
  return axiosInstance.get(`/auction/history/${auctionAddress}`).then((res) => res.data);
}
