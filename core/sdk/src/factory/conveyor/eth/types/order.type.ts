import { CreateOrderInput } from '@opensea/seaport-js/lib/types';
import { ethers } from 'ethers';
import { AssetType } from './asset.type';
export interface AssetInstance {
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

export interface OrderResponse {
  uuid: string;
  rawOrderParams: string;
  signature: string;
}

export interface ExecuteOrderParams {
  shopUuid: string;
  signer: ethers.providers.JsonRpcSigner;
  createOrderInput: CreateOrderInput;
  accountAddress: string;
}
