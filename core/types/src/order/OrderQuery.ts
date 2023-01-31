import { Blockchain, CommonQuery, SortBy } from '../commonQuery';
import { NftAttributeQuery } from '../nft';
import { Side, Status } from './OrderResponse';

type attributeType = { [key: string]: string };

export interface OrdersFilterQuery extends CommonQuery {
  sortBy?: SortBy | SortBy[];
  identifiers?: number[];
  sellerAddress?: string;
  attribute?: attributeType | attributeType[];
  candyShopAddress?: string;
  collectionId?: string;
  nftName?: string;
  masterEdition?: boolean;
  collectionKey?: string;
  blockchain?: Blockchain;
}

export interface OrdersEditionFilterQuery extends CommonQuery {}

export interface TradeQuery extends CommonQuery {
  identifiers?: number[];
  sortBy?: SortBy[] | SortBy;
}

export interface OrderQs extends CommonQuery {
  filterArr?: OrderFilter[];
}

export interface OrderFilter {
  side: Side;
  status: Status;
  attribute?: NftAttributeQuery;
  candyShopAddress?: string;
}

export interface OrderSortBy extends SortBy {}

export interface TradeQs extends CommonQuery {}
