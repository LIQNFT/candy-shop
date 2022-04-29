import { ListBase, Trade } from 'solana-candy-shop-schema/dist';
import { AxiosInstance } from 'axios';
import qs from 'qs';

export type TradeQuery = {
  offset?: number;
  limit?: number;
  identifiers?: number[];
};

export async function fetchTradeById(
  axiosInstance: AxiosInstance,
  storeId: string,
  queryDto?: TradeQuery
): Promise<ListBase<Trade>> {
  let queryString: string = '';
  const { offset, limit = 10, identifiers } = queryDto || {};
  let queryObj: any = {};

  if (identifiers) {
    queryObj.identifier = identifiers;
    // queryString = qs.stringify({ identifier: identifiers }, { indices: false });
  }
  if (offset) {
    queryObj = { ...queryObj, offset, limit };
  }

  queryString = qs.stringify(queryObj, { indices: false });

  return axiosInstance.get<ListBase<Trade>>(`/trade/${storeId}?${queryString}`).then((response) => response.data);
}
