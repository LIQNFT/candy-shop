import { BaseTransactionResult } from '../blockchain';
import { OrderInterface } from '../order';
import { ShopInterface } from '../shop';

export type MetamaskProvider = any;

export interface EthereumSDKInterface {
  makeConsumptionAllowance: (
    metamaskProvider: MetamaskProvider,
    consumptionUuid: string,
    address: string
  ) => Promise<BaseTransactionResult>;
  cancelOrder: (
    metamaskProvider: MetamaskProvider,
    orderUuid: string,
    address: string
  ) => Promise<BaseTransactionResult>;
  createShop: (metamaskProvider: MetamaskProvider, event: any, address: string) => Promise<ShopInterface>;
  updateShop: (metamaskProvider: MetamaskProvider, event: any, address: string) => Promise<void>;
  deleteShop: (metamaskProvider: MetamaskProvider, event: any, address: string) => Promise<void>;
  getShop: (uuid: string) => Promise<void>;
  fulfillOrder: (metamaskProvider: MetamaskProvider, event: any, address: string) => Promise<BaseTransactionResult>;
  makeOfferAllowance: (
    metamaskProvider: MetamaskProvider,
    consumptionUuid: string,
    address: string
  ) => Promise<BaseTransactionResult>;
  makeOrderConsumptionSignature: (
    metamaskProvider: MetamaskProvider,
    consumptionUuid: string,
    address: string
  ) => Promise<BaseTransactionResult>;
  getOrder: (uuid: string) => Promise<OrderInterface>;
  createOrder: (address: string, event: any) => Promise<OrderInterface>;
}
