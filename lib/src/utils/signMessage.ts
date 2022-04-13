import { Keypair } from '@solana/web3.js';
import { sign } from 'tweetnacl';

export function signMessage(keypair: Keypair, messageToSign: any) {
  const message = JSON.stringify(messageToSign);
  const messageB64 = Buffer.from(message);
  const signature = sign.detached(messageB64, keypair.secretKey);

  return {
    signature: Buffer.from(signature).toString('base64'),
    message: messageB64.toString('base64'),
    publicKey: keypair.publicKey.toBuffer().toString('base64'),
  };
}
