import { ListBase, Drop, DropQuery, DropActivityQuery, DropActivity, SingleBase } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';
import { RegisterDropParams, RegisterRedemptionParams } from '../../shop';
import { getParametrizeQuery } from './utils';

const Logger = 'CandyShopSDK/DropAPI';

export async function fetchDropsByStoreId(
  axiosInstance: AxiosInstance,
  storeId: string,
  queryDto?: DropQuery
): Promise<ListBase<Drop>> {
  let queryString = '';
  const {
    offset = 0,
    limit = 10,
    status,
    creator,
    nftMint,
    attributes,
    nftName,
    collectionKey,
    sortBy
  } = queryDto || {};
  const queryObj: any = { offset, limit, creator, nftMint, nftName, collectionKey };
  if (status !== undefined) {
    queryObj.status = status;
  }
  if (attributes?.length) {
    queryObj.attribute = attributes.map((item) => JSON.stringify(item));
  }
  if (sortBy) {
    const sortByArr = Array.isArray(sortBy) ? sortBy : [sortBy];
    queryObj.orderByArr = sortByArr.map((item) => JSON.stringify(item));
  }

  queryString = qs.stringify(queryObj, { indices: false });
  const url = `/drop/${storeId}`.concat(getParametrizeQuery(queryString));

  console.log(`${Logger}: fetching Drops By ShopId=${storeId}, query=${queryString}`);
  return axiosInstance.get<ListBase<Drop>>(url).then((response) => response.data);
}

export async function fetchDropActivities(axiosInstance: AxiosInstance, dropActivityQuery: DropActivityQuery) {
  const { walletAddress, offset = 0, limit = 10 } = dropActivityQuery;
  const queryString = qs.stringify({ walletAddress, offset, limit });
  const url = `/drop/activity`.concat(getParametrizeQuery(queryString));
  return axiosInstance.get<ListBase<DropActivity>>(url).then((response) => response.data);
}

export async function registerRedemption(axiosInstance: AxiosInstance, data: RegisterRedemptionParams) {
  const url = `/v2/drop/redemption/register`;
  return axiosInstance.post<SingleBase<boolean>>(url, data).then((response) => response.data);
}

export async function registerDrop(axiosInstance: AxiosInstance, data: RegisterDropParams) {
  const url = `/v2/drop/redemptionDrop/register`;
  return axiosInstance.post<SingleBase<boolean>>(url, data).then((response) => response.data);
}
