import { BaseShop, ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import Web3Modal from 'web3modal';

import { Blockchain, NftAttributeQuery, CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export enum TransactionState {
  DISPLAY,
  PROCESSING,
  CONFIRMED
}

export interface ShopExchangeInfo {
  symbol?: string;
  decimals: number;
}

export interface CollectionFilter {
  name: string;
  collectionId: string;
  identifier: number | Array<number>;
  attribute?: NftAttributeQuery;
}

export interface ShopFilter {
  name: string;
  shopId: string;
}

export enum OrderDefaultFilter {
  COLLECTION = 'collection',
  SHOP = 'shop'
}

export enum NFTPaymentStatus {
  Init = 'Init',
  Processing = 'Processing',
  Succeed = 'Succeed',
  Failed = 'Failed'
}

export enum BuyModalState {
  DISPLAY,
  PROCESSING,
  CONFIRMED,
  PAYMENT,
  PAYMENT_ERROR
}

export enum CreditCardPayAvailability {
  Unsupported = 'Unsupported',
  Supported = 'Supported',
  // Not enough balance
  Disabled = 'Disabled'
}
interface PaymentErrorMoreInfo {
  content: string;
  linkText: string;
  link: string;
}
export interface PaymentErrorDetails {
  title: string;
  content: string;
  moreInfo?: PaymentErrorMoreInfo;
}

export interface EthWallet {
  publicKey: string | undefined;
  web3Modal: Web3Modal;
}

export interface ShopInfo {
  candyShopAddress: string;
  env: Blockchain;
  baseUnitsPerCurrency: number;
  priceDecimalsMin: number;
  priceDecimals: number;
  explorerLink: ExplorerLinkBase;
  volumeDecimalsMin: number;
  volumeDecimals: number;
  currencySymbol: string;
  blockchain?: string;
}

export type Wallet = EthWallet | AnchorWallet;

export type ShopProps = {
  candyShop: BaseShop;
  wallet?: Wallet;
  shopResponse?: CandyShopResponse;
};

export interface ConfigPrice {
  currencySymbol: string;
  baseUnitsPerCurrency: number;
  priceDecimalsMin: number;
  priceDecimals: number;
}
