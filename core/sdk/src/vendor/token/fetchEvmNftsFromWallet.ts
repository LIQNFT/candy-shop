import axiosInstance from '../config';
import { Blockchain, FetchEvmWalletNftQuery, ListBaseWithCursor } from '@liqnft/candy-shop-types';
import { fetchEvmChainNftsFromWallet } from '../../factory/backend';
import { SingleTokenInfo } from './fetchMetadata';
import { FetchNFTBatchParam, FetchNFTCollectionParams } from './fetch.type';

const Logger = 'CandyShopSDK/fetchEvmNftsFromWallet';

const DEFAULT_PAGE_SIZE_LIMIT = 20;

/**
 * Will not support cache flow since we can not know which page we should fetch for
 * those removed/added Evm nfts to update cached nfts.
 * @note Fetch all NFTs from target wallet on certain Evm chain
 * @param walletAddress
 * @param chain Blockchain
 * @param fetchNFTBatchParam the param object to specify batchCallback and batchSize
 * @param collections specify the EVM collection to fetch by array of smart contract address
 * @returns array of the SingleTokenInfo in Promise
 */
export const fetchAllEvmNftsFromWallet = async (
  walletAddress: string,
  chain: Blockchain,
  fetchNFTCollectionParams: FetchNFTCollectionParams,
  fetchNFTBatchParam?: FetchNFTBatchParam
): Promise<SingleTokenInfo[]> => {
  // Apply the batchCallback logic to page limit call from DB
  const limit = fetchNFTBatchParam?.batchSize ?? DEFAULT_PAGE_SIZE_LIMIT;
  const totalCount = Number.MAX_SAFE_INTEGER;

  const fetchQuery: FetchEvmWalletNftQuery = {
    limit: limit,
    chain: chain
  };
  let singleTokenInfos: SingleTokenInfo[] = [];
  let evmNfts: ListBaseWithCursor<SingleTokenInfo>;
  while (totalCount > singleTokenInfos.length) {
    evmNfts = await fetchEvmNftsFromWalletByLimit(walletAddress, fetchNFTCollectionParams.shopId, fetchQuery);
    if (evmNfts.success) {
      singleTokenInfos = singleTokenInfos.concat(evmNfts.result);
    }

    if (fetchNFTBatchParam?.batchCallback) {
      // Only provide the batch result when batchCallback is specified.
      fetchNFTBatchParam.batchCallback(singleTokenInfos);
    }
    // If cursor is available, continue to fetch until unavailable.
    if (evmNfts.cursor) {
      fetchQuery.cursor = evmNfts.cursor;
    } else {
      break;
    }
  }
  console.log(`${Logger}: fetchAllEvmNftsFromWallet tokenInfos=`, singleTokenInfos);
  return singleTokenInfos;
};

const fetchEvmNftsFromWalletByLimit = async (
  walletAddress: string,
  shopId: string,
  query?: FetchEvmWalletNftQuery
): Promise<ListBaseWithCursor<SingleTokenInfo>> => {
  return fetchEvmChainNftsFromWallet(axiosInstance, walletAddress, shopId, query);
};
