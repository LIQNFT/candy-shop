import { ListBase, Drop, DropQuery } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';

const Logger = 'CandyShopSDK/DropAPI';

export async function fetchDropsByStoreId(
  axiosInstance: AxiosInstance,
  storeId: string,
  queryDto?: DropQuery
): Promise<ListBase<Drop>> {
  let queryString: string = '';
  const { offset = 0, limit = 10, status, creator, nftMint } = queryDto || {};
  let queryObj: any = { offset, limit, creator, nftMint };
  if (status !== undefined) {
    queryObj.status = status;
  }
  queryString = qs.stringify(queryObj, { indices: false });
  const url = `/drop/${storeId}?${queryString}`;

  console.log(`${Logger}: fetching Drops By ShopId=${storeId}, query=${queryString}`);
  return axiosInstance.get<ListBase<Drop>>(url).then((response) => response.data);
}
