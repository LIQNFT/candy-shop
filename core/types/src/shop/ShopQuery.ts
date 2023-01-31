import { CommonQuery } from '../commonQuery';
import { ShopStatusType } from './ShopResponse';

export interface ShopQs extends CommonQuery {}

export interface ShopStatusQuery {
  walletAddress?: string;
  targets?: ShopStatusType[];
}

export interface ShopQuery extends CommonQuery {
  name?: string;
}

export interface CollectionQuery extends CommonQuery {
  shopId?: string;
  name?: string;
}
