export enum TransactionState {
  DISPLAY,
  PROCESSING,
  CONFIRMED
}

export interface ShopExchangeInfo {
  symbol: string;
  decimals: number;
}

export interface CollectionFilter {
  name: string;
  identifier: number | Array<number>;
  attribute?: { [key: string]: string };
}

export interface ShopFilter {
  name: string;
  shopId: string;
}

export enum OrderDefaultFilter {
  COLLECTION = 'COLLECTION',
  SHOP = 'SHOP'
}
