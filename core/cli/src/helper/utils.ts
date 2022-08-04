import { web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';

export const CANDY_SHOP_PROGRAM_ID = new web3.PublicKey('csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN');

export const CANDY_SHOP_V2_PROGRAM_ID = new web3.PublicKey('csbMUULiQfGjT8ezT16EoEBaiarS6VWRevTw1JMydrS');

export function loadKey(keypair: string): web3.Keypair {
  const wallet = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())));
  return wallet;
}

export function loadTokenAccountMints(path: string): string[] {
  return JSON.parse(fs.readFileSync(path).toString());
}

export async function findAssociatedTokenAddress(
  walletAddress: web3.PublicKey,
  tokenMintAddress: web3.PublicKey
): Promise<web3.PublicKey> {
  return (
    await web3.PublicKey.findProgramAddress(
      [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
}

export function isEnterprise(isEnterpriseArg: string): boolean {
  return isEnterpriseArg === 'true';
}
