import { BlockchainType } from '../../shop';
import { PublicKey } from '@solana/web3.js';

export const getRequestBody = (
  blockchain: BlockchainType,
  signature: Uint8Array,
  message: Buffer | string,
  publicKey: PublicKey | string
) => {
  switch (blockchain) {
    case BlockchainType.EVM:
      return {
        message: message,
        address: (publicKey as string).toLowerCase(),
        signature: signature
      };
    case BlockchainType.SOL:
      return {
        signature: Buffer.from(signature).toString('base64'),
        publicKey: (publicKey as PublicKey).toBuffer().toString('base64'),
        message: Buffer.from(message).toString('base64')
      };
    default:
      throw new Error('unknown blockchainType');
  }
};
