export function sleepPromise(ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

/* Helper buddy for removing async/await try/catch litter */
export const safeAwait = (promise: Promise<any>, finallyCallback?: any) => {
  return promise
    .then((data) => {
      return { result: data, error: undefined };
    })
    .catch((error: Error) => {
      return { result: undefined, error: error };
    })
    .finally(() => {
      if (finallyCallback && typeof finallyCallback === 'function') {
        finallyCallback();
      }
    });
};

export const fetchDataArrayInBatches = async (
  array: any[],
  returnResult: any,
  singleItemAsyncCallback: any
) => {
  if (!array || !singleItemAsyncCallback) return;
  if (!returnResult) {
    console.debug(
      'fetchArrayInBatchesPromise: returnResult should not be undefined.'
    );
    return;
  }
  const chunkSize = 20;
  const delayMs = 1000;
  console.log(
    `fetchArrayInBatchesPromise: Executing ${array.length} promises in batches with chunkSize ${chunkSize} per ${delayMs} ms.`
  );
  let batchNum = 1;
  let count = 0;
  while (count < array.length) {
    const batch = array.slice(count, count + chunkSize);
    const tokenInfoBatch = await Promise.all(
      batch.map((token) => singleItemAsyncCallback(token))
    );
    returnResult = returnResult.concat(tokenInfoBatch);
    await sleepPromise(delayMs);
    console.log(
      `fetchArrayInBatchesPromise: The batch ${batchNum} have been all resolved.`
    );
    batchNum++;
    count += chunkSize;
  }
  return returnResult;
};
