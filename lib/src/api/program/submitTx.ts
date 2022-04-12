import { web3 } from '@project-serum/anchor';

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

export async function awaitTransactionSignatureConfirmation(
  connection: web3.Connection,
  rawTransaction: Buffer
): Promise<string> {
  const timeout = 32000;
  const bufferMs = 2000;
  const startTime = getUnixTs();
  let done = false;
  let txid: web3.TransactionSignature | null = null;
  (async () => {
    while (!done && getUnixTs() - startTime < timeout - bufferMs) {
      // log.debug("sending tx in background");
      txid = await connection
        .sendRawTransaction(rawTransaction, {
          skipPreflight: true,
        })
        .catch((err) => {
          console.error(err.toString());
          return null;
        });
      await sleep(500);
    }
  })();
  let status: web3.SignatureStatus | null;
  status = await new Promise(async (resolve, reject) => {
    while (!done && getUnixTs() - startTime < timeout) {
      if (typeof txid !== 'undefined') {
        (async () => {
          try {
            if (txid === null) return;
            const signatureStatuses = await connection.getSignatureStatuses([
              txid,
            ]);

            status = signatureStatuses && signatureStatuses.value[0];
            console.log('status', status);

            if (!done) {
              const parsedStatus =
                status === null ? null : status.confirmationStatus;
              console.debug(`txid ${txid} parsedStatus ${parsedStatus}`);

              if (!status) {
                console.debug(`REST null result for ${txid}`);
              } else if (status.err) {
                console.debug(`REST error for ${txid}`);
                done = true;
                reject(status.err);
              } else if (!status.confirmations) {
                console.debug(`REST no confirmations for ${txid}`);
              } else {
                console.debug(`REST confirmation for ${txid}`);
                done = true;
                resolve(status);
              }
            }
          } catch (e: any) {
            if (!done) {
              console.debug(
                'REST connection error: txid %s %s',
                txid,
                e.toString()
              );
            }
          }
        })();
      }
      await sleep(2000);
    }
  });

  if (txid === null) {
    throw new Error('unknown error, please contact support');
  }

  done = true;
  console.debug(`status ${status!.confirmationStatus}`);
  return txid;
}
