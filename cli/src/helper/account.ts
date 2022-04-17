import { web3, Program, Idl, Provider } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import { AUCTION_HOUSE_PROGRAM_ID } from '@liqnft/candy-shop-sdk/dist/api/constants';

import fs from 'fs';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

const CANDY_SHOP_PROGRAM_ID = new web3.PublicKey(
  'csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN'
);
const METADATA_PROGRAM_ID = new web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

export async function loadWalletKeyAndProgram(
  keypair: string,
  env: web3.Cluster
): Promise<[web3.Keypair, Program<Idl>, Program<Idl>]> {
  if (!keypair || keypair == '') {
    throw new Error('Keypair is required!');
  }
  const wallet = web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString()))
  );
  console.info(`wallet public key: ${wallet.publicKey}`);

  const options = Provider.defaultOptions();
  const connection = new web3.Connection(
    env === 'mainnet-beta'
      ? 'https://ssc-dao.genesysgo.net'
      : web3.clusterApiUrl(env),
    options.commitment
  );

  const provider = new Provider(connection, new NodeWallet(wallet), options);
  anchor.setProvider(provider);

  const idl = await anchor.Program.fetchIdl(CANDY_SHOP_PROGRAM_ID, provider);
  const program = new anchor.Program(idl!, CANDY_SHOP_PROGRAM_ID, provider);

  const ahIdl = await anchor.Program.fetchIdl(
    AUCTION_HOUSE_PROGRAM_ID,
    provider
  );
  const ahProgram = new anchor.Program(
    ahIdl!,
    AUCTION_HOUSE_PROGRAM_ID,
    provider
  );

  return [wallet, program, ahProgram];
}

export async function getMetadataAccount(tokenMint: web3.PublicKey) {
  return web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      tokenMint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
}
