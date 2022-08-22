import { ListBase, Drop, DropQuery, DropActivityQuery, DropActivity } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';

const Logger = 'CandyShopSDK/DropAPI';

export async function fetchDropsByStoreId(
  axiosInstance: AxiosInstance,
  storeId: string,
  queryDto?: DropQuery
): Promise<ListBase<Drop>> {
  let queryString: string = '';
  const { offset = 0, limit = 10, status, creator, nftMint, attributes } = queryDto || {};
  let queryObj: any = { offset, limit, creator, nftMint };
  if (status !== undefined) {
    queryObj.status = status;
  }
  if (attributes?.length) {
    queryObj.attribute = attributes.map((item) => JSON.stringify(item));
  }
  queryString = qs.stringify(queryObj, { indices: false });
  const url = `/drop/${storeId}?${queryString}`;

  console.log(`${Logger}: fetching Drops By ShopId=${storeId}, query=${queryString}`);
  return axiosInstance.get<ListBase<Drop>>(url).then((response) => response.data);
}

export async function fetchDropActivities(axiosInstance: AxiosInstance, dropActivityQuery: DropActivityQuery) {
  const { walletAddress, offset = 0, limit = 10 } = dropActivityQuery;
  const queryString = qs.stringify({ walletAddress, offset, limit });
  const url = `/drop/activity?${queryString}`;
  return axiosInstance.get<ListBase<DropActivity>>(url).then((response) => response.data);
}
