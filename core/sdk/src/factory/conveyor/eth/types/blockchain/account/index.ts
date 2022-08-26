import { ethers } from 'ethers';

export enum BlockchainAccountAccessType {
  PrivateKey = 1,
  Provider = 2
}

export type BlockchainPrivateKeyAccess = {
  address: string;
  type: BlockchainAccountAccessType.PrivateKey;
  privateKey: string;
};

export type BlockchainProvider = ethers.providers.JsonRpcProvider;

export type BlockchainProviderAccess = {
  address: string;
  type: BlockchainAccountAccessType.Provider;
  provider: BlockchainProvider;
};

export type BlockchainAccountAccess = BlockchainPrivateKeyAccess | BlockchainProviderAccess;
