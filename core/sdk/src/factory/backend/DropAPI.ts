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
  const { offset = 0, limit = 10, status } = queryDto || {};
  let queryObj: any = { offset, limit };
  if (status !== undefined) {
    queryObj.status = status;
  }
  queryString = qs.stringify(queryObj, { indices: false });
  const url = `/drop/${storeId}?${queryString}`;

  console.log(`${Logger}: fetching Drops By ShopId=${storeId}, query=${queryString}`);
  return axiosInstance.get<ListBase<Drop>>(url).then((response) => response.data);
}
