import { NftAttribute } from '../nft';
import { Side, Status, ShopStatusType } from '../response';

export interface SortBy {
  column: string;
  order: 'asc' | 'desc';
}

export interface OrderSortBy extends SortBy {}

type attributeType = { [key: string]: string };

interface QueryParams {
  offset?: number;
  limit?: number;
}

export interface OrdersFilterQuery extends QueryParams {
  sortBy?: SortBy | SortBy[];
  identifiers?: number[];
  sellerAddress?: string;
  attribute?: attributeType | attributeType[];
  candyShopAddress?: string;
  collectionId?: number;
  nftName?: string;
}

export interface TradeQuery extends QueryParams {
  identifiers?: number[];
  sortBy?: SortBy[] | SortBy;
}

// GET /api/order/{storeId}
export interface OrderQs extends QueryParams {
  filterArr?: OrderFilter[];
}

export interface OrderFilter {
  side: Side;
  status: Status;
  attribute?: NftAttribute;
  candyShopAddress?: string;
}

// GET /api/trade/{storeId}
export interface TradeQs extends QueryParams {}

// GET /api/shop
export interface ShopQs extends QueryParams {}

export interface ShopStatusQuery {
  walletAddress?: string;
  targets?: ShopStatusType[];
}

export interface CollectionQuery extends QueryParams {
  shopId?: string;
  name?: string;
}

export interface ShopQuery extends QueryParams {}
