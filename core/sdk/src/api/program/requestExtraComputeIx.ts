import * as anchor from '@project-serum/anchor';
import { TransactionInstruction } from '@solana/web3.js';
import { COMPUTE_BUDGET_PROGRAM_ID } from '../constants';

export const requestExtraComputeIx = (amount: number) => {
  const data = Buffer.concat([
    Buffer.from(new Uint8Array([0])),
    Buffer.from(new Uint8Array(new anchor.BN(amount).toArray('le', 4)))
  ]);

  const extraComputeIx = new TransactionInstruction({
    keys: [],
    programId: COMPUTE_BUDGET_PROGRAM_ID,
    data
  });

  return extraComputeIx;
};
