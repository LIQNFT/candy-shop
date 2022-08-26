import { BigNumber } from 'ethers';
import { BlockchainOrderInterface, BlockchainTransactionData, TypedDataDomain, TypedDataTypes } from '.';
import { OrderComponents, OrderParameters } from '@opensea/seaport-js/lib/types';
import { Seaport } from '@opensea/seaport-js';
import { BlockchainProvider } from './account';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BlockchainConsumptionAllowanceTransactionData
  extends BlockchainTransactionData<[string, string | BigNumber]> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BlockchainOfferAllowanceTransactionData extends BlockchainTransactionData<[string, boolean]> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BlockchainFulfillOrderTransactionData
  extends BlockchainTransactionData<[{ parameters: OrderParameters; signature: string }, string]> {}

export interface BlockchainCancelOrderTransactionData extends BlockchainTransactionData<OrderComponents[]> {}

export interface SeaportHelperInterface {
  convertOrderToOrderParameters: (order: BlockchainOrderInterface) => OrderParameters;
  convertOrderToOrderComponents: (order: BlockchainOrderInterface) => OrderComponents;
  getSeaport: (provider: BlockchainProvider) => Seaport;
  getDomainData: (seaport: Seaport) => Promise<TypedDataDomain>;
  getSignatureTypes: () => TypedDataTypes;
  getRandomSalt: () => string;
}
