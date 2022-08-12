import { BN } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { keypairIdentity, Metaplex } from '@metaplex-foundation/js';

export interface Env {
  nftMint: PublicKey;
  nftOwnerTokenAccount: PublicKey;
  masterEditionMetadataPublicKey: PublicKey;
  masterEditionPublicKey: PublicKey;
}

export const initEnvWithNftHolder = async (
  wallet: Keypair,
  nftOwner: Keypair,
  maxSupply: BN,
  connection: Connection
) => {
  const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

  const { tokenAddress, metadataAddress, masterEditionAddress, nft } = await metaplex
    .nfts()
    .create({
      uri: '',
      name: '',
      sellerFeeBasisPoints: 200,
      maxSupply: maxSupply,
      payer: wallet,
      owner: nftOwner.publicKey,
      mintAuthority: wallet
    })
    .run();

  return {
    nftMint: nft.mintAddress,
    nftOwnerTokenAccount: tokenAddress,
    masterEditionMetadataPublicKey: metadataAddress,
    masterEditionPublicKey: masterEditionAddress
  };
};

export const initWhitelistToken = async (authority: Keypair, connection: Connection): Promise<PublicKey> => {
  const metaplex = Metaplex.make(connection).use(keypairIdentity(authority));

  const { mintSigner } = await metaplex
    .tokens()
    .createMint({
      payer: authority,
      mintAuthority: authority.publicKey,
      decimals: 0
    })
    .run();

  // console.log(token);
  return mintSigner.publicKey;
};

export const mintWhitelistToken = async (
  authority: Keypair,
  mint: PublicKey,
  receiver: PublicKey,
  connection: Connection
) => {
  const metaplex = Metaplex.make(connection).use(keypairIdentity(authority));

  await metaplex
    .tokens()
    .mintTokens({
      mint,
      destination: receiver,
      mintAuthority: authority,
      amount: {
        basisPoints: new BN(1),
        currency: {
          symbol: '',
          decimals: 0
        }
      }
    })
    .run();
};
