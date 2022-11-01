import { ListBase, Trade, TradeQuery } from '@liqnft/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';
import { getParametrizeQuery } from './utils';

export async function fetchTradeById(
  axiosInstance: AxiosInstance,
  storeId: string,
  queryDto?: TradeQuery
): Promise<ListBase<Trade>> {
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

  const queryString = qs.stringify(queryObj, { indices: false });
  const url = `/trade/${storeId}`.concat(getParametrizeQuery(queryString));

  return axiosInstance.get<ListBase<Trade>>(url).then((response) => response.data);
}
