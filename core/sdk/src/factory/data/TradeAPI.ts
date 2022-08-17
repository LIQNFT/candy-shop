import { ListBase, Trade, TradeQuery } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';

export async function fetchTradeById(
  axiosInstance: AxiosInstance,
  storeId: string,
  queryDto?: TradeQuery
): Promise<ListBase<Trade>> {
  let queryString: string = '';
  const { offset, limit = 10, identifiers, sortBy } = queryDto || {};
  let queryObj: any = {};

  if (identifiers) {
    queryObj.identifier = identifiers;
    // queryString = qs.stringify({ identifier: identifiers }, { indices: false });
  }
  if (offset) {
    queryObj = { ...queryObj, offset, limit };
  }

  if (sortBy) {
    const sortByArr = Array.isArray(sortBy) ? sortBy : [sortBy];
    queryObj.orderByArr = sortByArr.map((item) => JSON.stringify(item));
  }

  queryString = qs.stringify(queryObj, { indices: false });

  return axiosInstance.get<ListBase<Trade>>(`/trade/${storeId}?${queryString}`).then((response) => response.data);
}
