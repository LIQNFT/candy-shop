import { NftAttributeQuery } from '@liqnft/candy-shop-types';

export enum TransactionState {
  DISPLAY,
  PROCESSING,
  CONFIRMED
}

export interface ShopExchangeInfo {
  symbol?: string;
  decimals: number;
}

export interface CollectionFilter {
  name: string;
  collectionId: string;
  identifier: number | Array<number>;
  attribute?: NftAttributeQuery;
}

export interface ShopFilter {
  name: string;
  shopId: string;
}

export enum OrderDefaultFilter {
  COLLECTION = 'collection',
  SHOP = 'shop'
}

export enum NFTPaymentStatus {
  Init = 'Init',
  Processing = 'Processing',
  Succeed = 'Succeed',
  Failed = 'Failed'
}
