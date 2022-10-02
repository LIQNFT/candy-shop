import { SingleTokenInfo } from './fetchMetadata';

/**
 * Object to help determining the batch options.
 * @property batchCallback method for retrieving the batch array during fetches
 * @property batchSize size for specifying the size of array for a fetch call
 */
export interface FetchNFTBatchParam {
  batchCallback?: (batchTokenInfos: SingleTokenInfo[]) => void;
  batchSize?: number;
}

/**
 * Object to help using IndexedDB to cache NFT, default is disabled.
 * @property enable a boolean if want to enable/disable Cache in IndexedDB
 */
export interface CacheNFTParam {
  // TODO: provide flexibility for caller to cacheNFT such as store name, duration, upper bound of entries,
  // maximum size of memory usage, etc.
  enable: boolean;
}
