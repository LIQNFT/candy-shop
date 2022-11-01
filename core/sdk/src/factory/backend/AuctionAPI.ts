import { SingleBase, ListBase, Auction, AuctionBid, AuctionQuery, AuctionBidQuery } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';
import { getParametrizeQuery } from './utils';

const Logger = 'CandyShopSDK/AuctionAPI';

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
  const url = `/auction/${shopId}`.concat(getParametrizeQuery(queryString));
  return axiosInstance.get<ListBase<Auction>>(url).then((response) => response.data);
}

export function fetchAuctionBid(
  axiosInstance: AxiosInstance,
  auctionAddress: string,
  walletAddress: string
): Promise<SingleBase<AuctionBid>> {
  console.log(`${Logger}: fetching Auction bid by auctionAddress=${auctionAddress}, walletAddress=${walletAddress}`);
  const url = `/auction/${auctionAddress}/wallet/${walletAddress}`;
  return axiosInstance.get<SingleBase<AuctionBid>>(url).then((res) => res.data);
}

export function fetchAuction(axiosInstance: AxiosInstance, auctionAddress: string): Promise<SingleBase<Auction>> {
  console.log(`${Logger}: fetching Auction detail, auctionAddress=${auctionAddress}`);
  const url = `/auction/${auctionAddress}`;
  return axiosInstance.get<SingleBase<Auction>>(url).then((res) => res.data);
}

export function fetchAuctionHistoryByAddress(
  axiosInstance: AxiosInstance,
  auctionAddress: string,
  auctionBidQuery?: AuctionBidQuery
): Promise<ListBase<AuctionBid>> {
  let queryString = '';

  if (auctionBidQuery) {
    if (auctionBidQuery.orderByArr) {
      queryString = qs.stringify({ ...auctionBidQuery, orderByArr: JSON.stringify(auctionBidQuery.orderByArr) });
    } else {
      queryString = qs.stringify(auctionBidQuery);
    }
  }
  console.log(`${Logger}: fetching Auction bid history by auctionAddress=`, auctionAddress, `query=`, queryString);
  const url = `/auction/history/${auctionAddress}`.concat(getParametrizeQuery(queryString));
  return axiosInstance.get<ListBase<AuctionBid>>(url).then((res) => res.data);
}
