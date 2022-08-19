import { AssetInstanceBaseInterface } from '.';
import { NativeAsset } from '../asset';

export interface NativeAssetInstanceData {
  value: string;
}

export type NativeAssetInstance = AssetInstanceBaseInterface & {
  asset?: NativeAsset;
} & NativeAssetInstanceData;
