import { DBSchema } from 'idb';
import { SingleTokenInfo } from '../vendor';

export const USER_NFT_OBJECT_STORE = 'UserNFT';

// Generally, should not store multi-structure object in single entry, potential main-thread blocking.
// TODO: Add service worker to handle IDB in worker thread once we have use case that store NFTs in many wallets in same browser domain.
export interface CandyShopDB extends DBSchema {
  [USER_NFT_OBJECT_STORE]: {
    key: string; // wallet address
    value: SingleTokenInfo[];
  };
}
