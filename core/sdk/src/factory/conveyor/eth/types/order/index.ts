import { CreateAssetInstanceInterface, NFTAssetInstance, PaymentAssetInstance } from '../asset-instance';
import { ShopInterface } from '../shop';
import { OrderAdditionalInterface } from './additional';

export enum OrderStatus {
  Open = 1,
  Filled = 2,
  UnExecutable = 3,
  Cancelled = 4
}

export interface ConsumptionInterface {
  uuid: string;
  orderUuid: string;
  order?: OrderInterface;
  assetInstanceUuid: string;
  assetInstance?: PaymentAssetInstance;
  signature?: string;
}

export interface OrderInterface {
  uuid: string;
  status?: OrderStatus;
  shopUuid: string;
  shop?: ShopInterface;
  offerUuid: string;
  offer?: NFTAssetInstance;
  consumption?: ConsumptionInterface[];
  offererAddress: string;
  additionalUuid: string;
  additional?: OrderAdditionalInterface;
  createdAt?: string;
}

export interface CreateOrderInterface {
  offererAddress: string;
  shopUuid: string;
  offer: CreateAssetInstanceInterface;
  consumption: CreateAssetInstanceInterface[];
}
