import { BlockchainAccountAccess } from './account';
import { BlockchainNetworkInfo } from './network';
import { ConsumptionInterface, OrderInterface } from '../order';
import { OrderAdditionalInterface } from '../order/additional';
import { BigNumberish, BytesLike } from 'ethers';
import { NFTAssetInstance } from '../asset-instance';

export type BaseTransactionResult = {
  transactionHash: string;
};

export interface BlockchainPublicParams {
  networkInfo: BlockchainNetworkInfo;
}

export interface BlockchainPrivateParams extends BlockchainPublicParams {
  access: BlockchainAccountAccess;
}

export interface TypedDataDomain {
  name?: string;
  version?: string;
  chainId?: BigNumberish;
  verifyingContract?: string;
  salt?: BytesLike;
}

export interface TypedDataField {
  name: string;
  type: string;
}

export type TypedDataTypes = Record<string, Array<TypedDataField>>;

export interface BlockchainSignData {
  domain: TypedDataDomain;
  types: TypedDataTypes;
  value: Record<string, any>;
}

export interface BlockchainOrderInterface extends Partial<OrderInterface> {
  uuid: string;
  offer: NFTAssetInstance;
  offererAddress: string;
  additional?: OrderAdditionalInterface;
  createdAt: string;
  selectedConsumption: ConsumptionInterface;
  payments: BlockchainOrderPaymentAssetSplit[];
}

export type BlockchainOrderPaymentAssetSplit = {
  receiverAddress: string;
  percentage: string;
};

export interface BlockchainTransactionData<T extends unknown[]> {
  domain?: TypedDataDomain;
  contractAddress: string;
  functionName: string;
  params?: T;
  value?: string;
}

export enum BlockchainOrderStatus {
  Active = 1,
  Cancelled = 2,
  Filled = 3
}
