import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { sleepPromise } from './promiseUtils';
import {
  SingleTokenInfo,
  singleTokenInfoPromise,
  SingleTokenInfoPromiseParam
} from './fetchMetadata';
import { web3 } from '@project-serum/anchor';

// The endpoint we're using has request limitation.
// To play safe, set upper bound is 40 batches per 1000 ms
// 1 batch at least needs to wait (1000 / 40) ms to continue.
const DEFAULT_BATCH_SIZE = 40;
const DEFAULT_INTERVAL_MS = 1000;
const PER_BATCH_UPPER_BOUND_MS = DEFAULT_INTERVAL_MS / DEFAULT_BATCH_SIZE;

/**
 * @field batchSize will be restricted to 40 as maximum due to endpoint limitation,
 * will increase it or have flexibility to allow caller to set the limitation by
 * their specified endpoint.
 */
export interface FetchNFTBatchParam {
  batchCallback?: (batchTokenInfos: SingleTokenInfo[]) => void;
  batchSize?: number;
}
/**
 * @param connection anchor.web3.Connection
 * @param walletAddress target wallet anchor.web3.PublicKey to fetch the NFTs
 * @param identifiers for differentiate the collection
 * @param fetchNFTBatchParam the param object to specify batchCallback and batchSize
 * @returns array of the SingleTokenInfo in Promise
 */
export const fetchNftsFromWallet = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey,
  identifiers: string[],
  fetchNFTBatchParam?: FetchNFTBatchParam
): Promise<SingleTokenInfo[]> => {
  const validTokenAccounts = await getValidTokenAccounts(
    connection,
    walletAddress
  );
  const singleTokenInfoPromiseParams = validTokenAccounts.map(
    (tokenAccountAddress) => {
      const param: SingleTokenInfoPromiseParam = {
        connection: connection,
        identifiers: identifiers,
        tokenAccountAddress: tokenAccountAddress
      };
      return param;
    }
  );

  console.log(
    'fetchNftsFromWallet: singleTokenInfoPromiseParams=',
    singleTokenInfoPromiseParams
  );

  return fetchDataArrayInBatches(
    singleTokenInfoPromiseParams,
    singleTokenInfoPromise,
    fetchNFTBatchParam?.batchCallback,
    fetchNFTBatchParam?.batchSize
  );
};

const fetchDataArrayInBatches = async (
  array: SingleTokenInfoPromiseParam[],
  singleTokenInfoPromise: (
    param: SingleTokenInfoPromiseParam
  ) => Promise<SingleTokenInfo | null>,
  batchCallback?: (batchTokenInfos: SingleTokenInfo[]) => void,
  batchSize?: number
): Promise<SingleTokenInfo[]> => {
  const validBatchSize = getValidChunkSize(batchSize);
  const delayMs = validBatchSize * PER_BATCH_UPPER_BOUND_MS;
  console.log(
    `fetchDataArrayInBatches: Executing ${array.length} promises in batches with size= ${validBatchSize} per ${delayMs} ms.`
  );
  let aggregated: SingleTokenInfo[] = [];
  let batchNum = 1;
  let count = 0;
  while (count < array.length) {
    const batch = array.slice(count, count + validBatchSize);
    const promises = batch.map((param: SingleTokenInfoPromiseParam) =>
      singleTokenInfoPromise(param)
    );
    const tokenInfoBatch = await Promise.all(promises);
    console.log(
      `fetchDataArrayInBatches: The batch ${batchNum} have been all resolved.`
    );
    const validTokenInfoBatch = tokenInfoBatch.filter(
      (res) => res !== null
    ) as SingleTokenInfo[];
    // Only provide the batch result when batchCallback is specified.
    if (batchCallback) {
      batchCallback(validTokenInfoBatch);
    }
    aggregated = aggregated.concat(validTokenInfoBatch);
    await sleepPromise(delayMs);
    batchNum++;
    count += validBatchSize;
  }
  return aggregated;
};

const getValidTokenAccounts = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey
) => {
  // Filter out invalid token which is not NFT.
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletAddress,
    { programId: TOKEN_PROGRAM_ID }
  );
  return tokenAccounts.value
    .filter((account) => {
      const tokenAmount = account.account.data.parsed.info.tokenAmount;
      const tokenAmountIsOne = Number(tokenAmount.amount) === 1;
      const tokenDecimalsIsZero = Number(tokenAmount.decimals) === 0;
      if (tokenAmountIsOne && tokenDecimalsIsZero) return true;
      return false;
    })
    .map((account) => account.pubkey.toString());
};

const getValidChunkSize = (chunkSize: number | undefined): number => {
  if (!chunkSize || (chunkSize && chunkSize > DEFAULT_BATCH_SIZE)) {
    return DEFAULT_BATCH_SIZE;
  }
  return chunkSize;
};
