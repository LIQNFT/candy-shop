import { AssetType } from './asset.type';
import { Status } from '@liqnft/candy-shop-types';
export interface AssetInstanceInterface {
  address: string;
  type: AssetType;
  symbol?: string;
  tokenId?: string;
  value?: string;
  name?: string;
}

export interface SeaportOrderAdditionalInterface {
  seaportCounter: number;
  seaportZoneAddress: string;
  seaportSalt: string;
}

export interface OrderInterface {
  offererAddress: string;
  offerNftAssets: AssetInstanceInterface[];
  considerationAssets: AssetInstanceInterface[];
  shopUuid: string;
  networkUuid: string;
  createdAt: number;
}

export interface CreateOrderInterface extends OrderInterface {
  additional: SeaportOrderAdditionalInterface;
  signature?: string;
}

export interface OrderResponse {
  uuid: string;
  status: Status;
  shopUuid: string;
  offererAddress: string;
  offers: OfferResponse[];
  considerations: ConsiderationResponse[];
  rawOrderParams: string;
  signature: string;
  createdAt: Date;
}

interface OfferResponse {
  address: string;
  type: AssetType;
  tokenId: string;
}

interface ConsiderationResponse {
  address: string;
  type: AssetType;
  value: string;
}
