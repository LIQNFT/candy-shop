import { BlockchainType } from '@liqnft/candy-shop-sdk';
import { Blockchain } from '@liqnft/candy-shop-types';

export const getBlockChain = (network: Blockchain): BlockchainType => {
  if (network === Blockchain.SolDevnet || network === Blockchain.SolMainnetBeta) {
    return BlockchainType.Solana;
  }

  return BlockchainType.Ethereum;
};
