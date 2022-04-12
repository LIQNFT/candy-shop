import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { sleepPromise } from '../utils/PromiseHelper';
import { SingleTokenInfo, singleTokenInfoPromise } from './fetchMetadata';

export const fetchNftsFromWallet = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey
): Promise<SingleTokenInfo[]> => {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletAddress,
    { programId: TOKEN_PROGRAM_ID }
  );

  return fetchDataArrayInBatches(
    connection,
    tokenAccounts.value
      .filter((acct) => {
        const tokenAmount = acct.account.data.parsed.info.tokenAmount;
        const tokenAmountIsOne =
          tokenAmount.amount === '1' || tokenAmount.amount === 1;
        const tokenDecimalsIsZero =
          tokenAmount.decimals === '0' || tokenAmount.decimals === 0;
        if (tokenAmountIsOne && tokenDecimalsIsZero) return true;
        return false;
      })
      .map((acct) => acct.pubkey.toString()),
    singleTokenInfoPromise
  );
};

const fetchDataArrayInBatches = async (
  connection: anchor.web3.Connection,
  array: any[],
  singleItemAsyncCallback: any
): Promise<SingleTokenInfo[]> => {
  const chunkSize = 20;
  const delayMs = 1000;
  console.log(
    `fetchArrayInBatchesPromise: Executing ${array.length} promises in batches with chunkSize ${chunkSize} per ${delayMs} ms.`
  );
  let aggregated: SingleTokenInfo[] = [];
  let batchNum = 1;
  let count = 0;
  while (count < array.length) {
    const batch = array.slice(count, count + chunkSize);
    const tokenInfoBatch = (
      await Promise.all(
        batch.map((tokenAccountAddress) =>
          singleItemAsyncCallback(connection, tokenAccountAddress)
        )
      )
    ).filter((res) => res != null);
    console.log(
      `fetchArrayInBatchesPromise: The batch ${batchNum} have been all resolved.`
    );
    aggregated = aggregated.concat(tokenInfoBatch);

    await sleepPromise(delayMs);
    batchNum++;
    count += chunkSize;
  }
  return aggregated;
};
