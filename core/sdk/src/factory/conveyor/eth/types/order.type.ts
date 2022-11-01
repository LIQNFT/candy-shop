import { AssetType } from './asset.type';
export interface AssetInstanceInterface {
  address: string;
  type: AssetType;
  tokenId?: string;
  value?: string;
}

export interface Offer {
  itemType: number;
  token: string;
  identifierOrCriteria: string;
  startAmount: string;
  endAmount: string;
}

export interface Consideration extends Offer {
  recipient: string;
}

export interface SeaportOrderData {
  counter: number;
  offerer: string;
  zone: string;
  orderType: number;
  startTime: string;
  endTime: string;
  zoneHash: string;
  salt: string;
  offer: Offer[];
  consideration: Consideration[];
  totalOriginalConsiderationItems: number;
  conduitKey: string;
}

export interface CreateOrderInterface {
  shopUuid: string;
  orderData: SeaportOrderData;
  signature: string;
}

export interface OrderResponse {
  uuid: string;
  rawOrderParams: string;
  signature: string;
}
