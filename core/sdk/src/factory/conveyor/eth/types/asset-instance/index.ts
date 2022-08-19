import { NativeAssetInstance, NativeAssetInstanceData } from './native';
import {
  ERC1155AssetInstance,
  ERC1155AssetInstanceData,
  ERC20AssetInstance,
  ERC20AssetInstanceData,
  ERC721AssetInstance,
  ERC721AssetInstanceData
} from './token';

export interface AssetInstanceBaseInterface {
  uuid: string;
  assetUuid: string;
}

export interface AssetInstanceStorageElementInterface
  extends AssetInstanceBaseInterface,
    Partial<NativeAssetInstanceData>,
    Partial<ERC20AssetInstanceData>,
    Partial<ERC721AssetInstanceData>,
    Partial<ERC1155AssetInstanceData> {}

export type AssetInstanceData =
  | NativeAssetInstanceData
  | ERC20AssetInstanceData
  | ERC721AssetInstanceData
  | ERC1155AssetInstanceData;

export type NFTAssetInstance = ERC721AssetInstance | ERC1155AssetInstance;
export type TokenAssetInstance = ERC20AssetInstance | NFTAssetInstance;
export type PaymentAssetInstance = NativeAssetInstance | ERC20AssetInstance;

export type AssetInstance = NFTAssetInstance | PaymentAssetInstance;

export interface CreateAssetInstanceInterface extends Partial<AssetInstanceStorageElementInterface> {
  assetUuid: string;
}
