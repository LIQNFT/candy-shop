import { AssetType } from './asset.type';

export interface ShopInterface {
  uuid: string;
  name: string;
  ownerAddress: string;
  logoUrl?: string;
  websiteUrl?: string;
  discordUrl?: string;
  twitterUrl?: string;
  paymentSplit: PaymentSplitInterface[];
  paymentAssets: AssetInterface[];
}

export enum SplitReceiver {
  Seller = 1,
  ShopOwner = 2,
  Platform = 3
}

export interface PaymentSplitInterface {
  percentage: string;
  receiver: SplitReceiver;
}

export interface AssetInterface {
  address: string;
  type: AssetType;
  symbol?: string;
  networkUuid: string;
}

export interface CreateOrUpdateShopInterface {
  name: string;
  ownerAddress: string;
  logoUrl?: string;
  websiteUrl?: string;
  discordUrl?: string;
  twitterUrl?: string;
  paymentAssets: AssetInterface[];
  paymentSplit: PaymentSplitInterface[];
  signature?: string;
}

export interface ShopResponse {
  uuid: string;
  name: string;
  ownerAddress: string;
  networkUuid: string;
  logoUrl: string;
  websiteUrl: string;
  discordUrl: string;
  twitterUrl: string;
  paymentSplit: PaymentSplitInterface[];
  paymentAssets: AssetInterface[];
  createdAt: string;
}
