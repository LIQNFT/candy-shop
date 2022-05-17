import { NftAttribute } from '../nft';
import { Side, Status } from '../response';

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
