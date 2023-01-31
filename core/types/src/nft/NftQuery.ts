import { Blockchain } from '../commonQuery';

export interface NftAttributeQuery {
  [trait_type: string]: string;
}

export interface FetchEvmWalletNftQuery {
  limit?: number;
  chain?: Blockchain;
  cursor?: string;
}
