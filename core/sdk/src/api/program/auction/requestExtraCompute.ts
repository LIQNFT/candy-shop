import * as anchor from '@project-serum/anchor';
import { TransactionInstruction } from '@solana/web3.js';
import { COMPUTE_BUDGET_PROGRAM_ID } from '../../constants';

export const requestExtraCompute = (amount: number) => {
  const data = Buffer.from(Uint8Array.of(0, ...new anchor.BN(amount).toArray('le', 4)));

  const extraComputeIx = new TransactionInstruction({
    keys: [],
    programId: COMPUTE_BUDGET_PROGRAM_ID,
    data
  });

  return extraComputeIx;
};
