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
  collectionId: string;
  identifier: number | Array<number>;
  attribute?: { [key: string]: string };
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

export enum BuyModalType {
  DISPLAY,
  PROCESSING,
  CONFIRMED,
  PAYMENT,
  PAYMENT_ERROR
}

interface MoreInfoPaymentError {
  content: string;
  linkText: string;
  link: string;
}
export interface PaymentError {
  title: string;
  content: string;
  moreInfo?: MoreInfoPaymentError;
}
