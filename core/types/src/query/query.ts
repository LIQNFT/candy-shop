import { NftAttribute } from '../nft';
import { Side, Status, ShopStatusType } from '../response';

export interface SortBy {
  column: string;
  order: 'asc' | 'desc';
}

export interface OrderSortBy extends SortBy {}

type attributeType = { [key: string]: string };

export interface OrdersFilterQuery {
  sortBy?: SortBy | SortBy[];
  offset?: number;
  limit?: number;
  identifiers?: number[];
  sellerAddress?: string;
  attribute?: attributeType | attributeType[];
  candyShopAddress?: string;
}

export type TradeQuery = {
  offset?: number;
  limit?: number;
  identifiers?: number[];
  sortBy?: SortBy[] | SortBy;
};

// GET /api/order/{storeId}
export interface OrderQs {
  offset?: number;
  limit?: number;
  filterArr?: OrderFilter[];
}

export interface OrderFilter {
  side: Side;
  status: Status;
  attribute?: NftAttribute;
  candyShopAddress?: string;
}

// GET /api/trade/{storeId}
export interface TradeQs {
  offset?: number;
  limit?: number;
}

// GET /api/shop
export interface ShopQs {
  offset?: number;
  limit?: number;
}

export interface ShopStatusQuery {
  walletAddress?: string;
  targets?: ShopStatusType[];
}
