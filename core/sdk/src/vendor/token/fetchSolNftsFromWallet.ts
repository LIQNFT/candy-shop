import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { web3 } from '@project-serum/anchor';
import {
  isValidWhitelistNft,
  SingleTokenInfo,
  singleTokenInfoPromise,
  SingleTokenInfoPromiseParam
} from './fetchMetadata';
import { deleteCandyShopIDB, retrieveWalletNftFromIDB, storeWalletNftToIDB } from '../../idb';
import { safeAwait, sleepPromise } from '../utils/promiseUtils';
import { parseMasterEditionV2 } from '../../factory/conveyor/sol/parseData';
import { TOKEN_METADATA_PROGRAM_ID } from '../../factory/constants';
import { CacheNFTParam, FetchNFTBatchParam } from './fetch.type';
import { MasterEditionNft, RawTokenInfo } from './token.type';

const Logger = 'CandyShopSDK/fetchSolNftsFromWallet';

// The endpoint we're using has request limitation.
// To play safe, set upper bound is 40 batches per 1000 ms
// 1 batch at least needs to wait (1000 / 40) ms to continue.
const DEFAULT_BATCH_SIZE = 40;
const DEFAULT_INTERVAL_MS = 1000;
const PER_BATCH_UPPER_BOUND_MS = DEFAULT_INTERVAL_MS / DEFAULT_BATCH_SIZE;

/**
 * @note Fetch all NFTs from target wallet on Solana chain
 * @param connection anchor.web3.Connection
 * @param walletAddress target wallet anchor.web3.PublicKey to fetch the NFTs
 * @param identifiers for differentiate the collection
 * @param fetchNFTBatchParam the param object to specify batchCallback and batchSize,
 * batchSize will be restricted to 40 as maximum due to endpoint limitation
 * @param cacheNFTParam the param object to specify cache options
 * @returns array of the SingleTokenInfo in Promise
 */
export const fetchNftsFromWallet = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey,
  identifiers: string[] | undefined,
  fetchNFTBatchParam?: FetchNFTBatchParam,
  cacheNFTParam?: CacheNFTParam
): Promise<SingleTokenInfo[]> => {
  const validTokenAccounts = await getValidTokenAccounts(connection, walletAddress);
  const singleTokenInfoPromiseParams = validTokenAccounts.map((tokenAccountAddress) => {
    const param: SingleTokenInfoPromiseParam = {
      connection: connection,
      identifiers: identifiers,
      tokenAccountAddress: tokenAccountAddress
    };
    return param;
  });

  const nftTokens = await getUserNFTDataArray(
    walletAddress.toString(),
    singleTokenInfoPromiseParams,
    fetchNFTBatchParam,
    cacheNFTParam
  );

  return nftTokens;
};

const getUserNFTDataArray = async (
  walletAddress: string,
  singleTokenInfoParams: SingleTokenInfoPromiseParam[],
  fetchNFTBatchParam?: FetchNFTBatchParam,
  cacheNFTParam?: CacheNFTParam
): Promise<SingleTokenInfo[]> => {
  let params = singleTokenInfoParams;
  let cachedTokens: SingleTokenInfo[] = [];

  if (cacheNFTParam?.enable) {
    cachedTokens = (await retrieveWalletNftFromIDB(walletAddress.toString())) ?? [];
  } else {
    // Delete NFT IDB if cacheNFT is disabled
    await deleteCandyShopIDB();
  }

  console.log(`${Logger}: Cached tokens in wallet ${walletAddress} =`, cachedTokens);
  cachedTokens = await removeOutdatedNftFromIDB(walletAddress, singleTokenInfoParams, cachedTokens);

  params = await updateSingleTokenParams(singleTokenInfoParams, cachedTokens);
  console.log(`${Logger}: Parameters for fetching from chain =`, params);

  let nftTokens = await fetchNFTDataArrayInBatches(
    params,
    singleTokenInfoPromise,
    fetchNFTBatchParam?.batchCallback,
    fetchNFTBatchParam?.batchSize,
    cachedTokens
  );
  // Concat cached nft and fetched nft
  nftTokens = cachedTokens.concat(nftTokens);

  // Update store object if cacheNFT is enabled and fetched tokens has updated
  if (cacheNFTParam?.enable && cachedTokens.length !== nftTokens.length) {
    await storeWalletNftToIDB(walletAddress, nftTokens);
    console.log(`${Logger}: Updated new token to cache, cached tokens =`, nftTokens);
  }
  return nftTokens;
};

const updateSingleTokenParams = async (
  singleTokenInfoParams: SingleTokenInfoPromiseParam[],
  cachedTokens: SingleTokenInfo[]
): Promise<SingleTokenInfoPromiseParam[]> => {
  // Compare stored tokens vs on-chain tokens by tokenAccount to get new added NFT token account
  for (const cachedToken of cachedTokens) {
    singleTokenInfoParams = singleTokenInfoParams.filter(
      (param: SingleTokenInfoPromiseParam) => param.tokenAccountAddress !== cachedToken.tokenAccountAddress
    );
  }
  return singleTokenInfoParams;
};

const removeOutdatedNftFromIDB = async (
  walletAddress: string,
  singleTokenInfoParams: SingleTokenInfoPromiseParam[],
  cachedTokens: SingleTokenInfo[]
): Promise<SingleTokenInfo[]> => {
  // Remove nft that token amount is zero by comparing all singleTokenInfoParams
  let removal = [...cachedTokens];
  for (const singleTokenParam of singleTokenInfoParams) {
    removal = removal.filter(
      (token) =>
        (token.metadata && !isValidWhitelistNft(singleTokenParam.identifiers, token.metadata)) ||
        token.tokenAccountAddress !== singleTokenParam.tokenAccountAddress
    );
  }
  if (removal.length > 0) {
    cachedTokens = cachedTokens.filter((token) => !removal.includes(token));
    console.log(`${Logger}: After removed outdated token, cache tokens=`, cachedTokens);
    await storeWalletNftToIDB(walletAddress, cachedTokens);
  }
  return cachedTokens;
};

const fetchNFTDataArrayInBatches = async (
  array: SingleTokenInfoPromiseParam[],
  singleTokenInfoPromise: (param: SingleTokenInfoPromiseParam) => Promise<SingleTokenInfo | null>,
  batchCallback?: (batchTokenInfos: SingleTokenInfo[]) => void,
  batchSize?: number,
  cachedTokenInfo?: SingleTokenInfo[]
): Promise<SingleTokenInfo[]> => {
  const validBatchSize = getValidChunkSize(batchSize);
  const delayMs = validBatchSize * PER_BATCH_UPPER_BOUND_MS;
  console.log(
    `${Logger}: Executing ${array.length} promises in batches with size ${validBatchSize} per ${delayMs} ms.`
  );
  let aggregated: SingleTokenInfo[] = [];
  let batchNum = 1;
  let count = 0;

  // Return cached tokens in first batch if batchCallback is specified and cache is available
  if (batchCallback && cachedTokenInfo) {
    batchCallback(cachedTokenInfo);
  }

  while (count < array.length) {
    const batch = array.slice(count, count + validBatchSize);
    const promises = batch.map((param: SingleTokenInfoPromiseParam) => singleTokenInfoPromise(param));
    const tokenInfoBatch = await Promise.all(promises);
    console.log(`${Logger}: The batch ${batchNum} have been all resolved.`);
    const validTokenInfoBatch = tokenInfoBatch.filter((res) => res !== null) as SingleTokenInfo[];
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

const getValidTokenAccounts = async (connection: anchor.web3.Connection, walletAddress: anchor.web3.PublicKey) => {
  // Filter out invalid token which is not NFT.
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, { programId: TOKEN_PROGRAM_ID });
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

export const fetchUserMasterNFTs = async (
  userWalletPublicKey: web3.PublicKey,
  connection: web3.Connection
): Promise<MasterEditionNft[]> => {
  const [rawTokens, nftsInfo] = await Promise.all([
    safeAwait(connection.getParsedTokenAccountsByOwner(userWalletPublicKey, { programId: TOKEN_PROGRAM_ID })),
    safeAwait(fetchNftsFromWallet(connection, userWalletPublicKey, undefined))
  ]);

  if (!rawTokens.result || !nftsInfo.result) {
    if (rawTokens.error) {
      console.log(`${Logger} connection.getParsedTokenAccountsByOwner failed, error=`, rawTokens.error);
    }
    if (nftsInfo.error) {
      console.log(`${Logger} fetchNftsFromWallet failed, error=`, nftsInfo.error);
    }
    return [];
  }

  const tokenInfoMap: Map<string, RawTokenInfo> = new Map();
  for (const token of rawTokens.result.value) {
    if (Number(token.account.data.parsed.info.tokenAmount.amount) > 0) {
      const item = {
        account: token.account,
        tokenPubkey: token.pubkey.toString(),
        tokenMint: token.account.data.parsed.info.mint,
        amount: token.account.data.parsed.info.tokenAmount.amount
      };
      tokenInfoMap.set(item.tokenPubkey, item);
    }
  }

  const nftsInfoMap = new Map<string, SingleTokenInfo>();
  for (const nft of nftsInfo.result) {
    nftsInfoMap.set(nft.tokenMintAddress, nft);
  }

  const nfts = await Promise.all(
    Array.from(tokenInfoMap.values()).map(async (e) => {
      const [newEditionPublicKey] = await web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          new web3.PublicKey(e.tokenMint).toBuffer(),
          Buffer.from('edition')
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const newEditionAccountInfoResult = await safeAwait(connection.getAccountInfo(newEditionPublicKey));
      if (newEditionAccountInfoResult.error) {
        console.log(`${Logger} getAccountInfo token=${e.tokenMint} failed, error=`, newEditionAccountInfoResult.error);
        return undefined;
      }

      if (!newEditionAccountInfoResult.result) {
        console.log(`${Logger} getAccountInfo token=${e.tokenMint} empty`);
        return undefined;
      }

      const masterEditionInfo = parseMasterEditionV2((newEditionAccountInfoResult.result as any).data);
      return {
        ...e,
        maxSupply: masterEditionInfo?.maxSupply?.toString(),
        supply: masterEditionInfo?.supply.toString()
      };
    })
  );

  return nfts.reduce((result: any[], nft) => {
    if (nft && nft.tokenMint && Number(nft.maxSupply) > 1) {
      const info = nftsInfoMap.get(nft.tokenMint);
      result.push({
        ...nft,
        ...info,
        name: info?.metadata?.data.name,
        symbol: info?.metadata?.data.symbol
      });
    }
    return result;
  }, []);
};
