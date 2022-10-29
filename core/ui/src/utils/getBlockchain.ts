import { BlockchainType } from '@liqnft/candy-shop-sdk';
import { Blockchain } from '@liqnft/candy-shop-types';

/* Getting main type of blockchain by Blockchain env */
export const getBlockChain = (network: Blockchain): BlockchainType => {
  if (network === Blockchain.SolDevnet || network === Blockchain.SolMainnetBeta) {
    return BlockchainType.SOL;
  }

  return BlockchainType.EVM;
};
