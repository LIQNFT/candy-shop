import { ComputeBudgetProgram } from '@solana/web3.js';

export const requestExtraComputeIx = (amount: number) => {
  return ComputeBudgetProgram.requestUnits({
    units: amount,
    additionalFee: 0
  });
};
