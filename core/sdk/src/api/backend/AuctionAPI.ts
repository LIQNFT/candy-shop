import { SingleBase, ListBase, Auction, AuctionBid, AuctionStatus } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';

const Logger = 'CandyShopSDK/AuctionAPI';

export type AuctionQuery = {
  offset?: number;
  limit?: number;
  status?: AuctionStatus[];
  walletAddress?: string;
};

export function fetchAuctionsByShop(
  axiosInstance: AxiosInstance,
  shopId: string,
  queryDto: AuctionQuery = {}
): Promise<ListBase<Auction>> {
  const { offset, limit = 10, status, walletAddress } = queryDto;
  console.log(`${Logger}: fetching Auctions By ShopId=`, shopId);

  let queryObj: any = {};
  if (offset !== undefined) {
    queryObj = { offset, limit };
  }

  if (status?.length) {
    queryObj = { ...queryObj, status };
  }

  if (walletAddress) {
    queryObj = { ...queryObj, walletAddress };
  }

  const queryString = qs.stringify(queryObj, { indices: false });
  return axiosInstance.get<ListBase<Auction>>(`/auction/${shopId}?${queryString}`).then((response) => response.data);
}

export function fetchAuctionBid(
  axiosInstance: AxiosInstance,
  auctionAddress: string,
  walletAddress: string
): Promise<SingleBase<AuctionBid>> {
  console.log(`${Logger}: fetching Auction bid by auctionAddress=${auctionAddress}, walletAddress=${walletAddress}`);
  return axiosInstance.get(`/auction/${auctionAddress}/wallet/${walletAddress}`).then((res) => res.data);
}

export function fetchAuction(axiosInstance: AxiosInstance, auctionAddress: string): Promise<SingleBase<Auction>> {
  console.log(`${Logger}: fetching Auction detail, auctionAddress=${auctionAddress}`);
  return axiosInstance.get(`/auction/${auctionAddress}`).then((res) => res.data);
}

export function fetchAuctionHistoryByAddress(
  axiosInstance: AxiosInstance,
  auctionAddress: string
): Promise<ListBase<AuctionBid>> {
  console.log(`${Logger}: fetching Auction bid history by auctionAddress=`, auctionAddress);
  return axiosInstance.get(`/auction/history/${auctionAddress}`).then((res) => res.data);
}
