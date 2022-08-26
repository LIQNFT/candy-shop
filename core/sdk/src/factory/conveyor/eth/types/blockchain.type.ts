import { BigNumberish, BytesLike } from 'ethers';

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
