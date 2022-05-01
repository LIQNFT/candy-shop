import { web3 } from '@project-serum/anchor';
import fs from 'fs';

export const CANDY_SHOP_PROGRAM_ID = new web3.PublicKey('csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN');

export const CANDY_SHOP_INS_PROGRAM_ID = new web3.PublicKey('cseLFQDeAfo96uQhA6MhiCzHzhmWu47VopVVvYmRDyE');

export function loadKey(keypair: string): web3.Keypair {
  const wallet = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())));
  return wallet;
}
