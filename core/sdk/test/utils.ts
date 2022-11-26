import { BN } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
// import { createAssociatedTokenAccount, createMint, mintTo } from "@solana/spl-token";
import { keypairIdentity, Metaplex, toBigNumber } from '@metaplex-foundation/js';
import * as metaplexJS from '@metaplex/js';
import { TOKEN_METADATA_PROGRAM_ID } from '../src/factory/constants';
import { getMetadataAccount } from '../src/vendor';

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
      maxSupply: toBigNumber(maxSupply),
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

export const initEnvWithSftHolder = async (
  wallet: Keypair,
  sftOwner: Keypair,
  mintAmount: number,
  connection: Connection
) => {
  // const sftMint = await createMint(
  //   connection,
  //   wallet,
  //   wallet.publicKey,
  //   wallet.publicKey,
  //   0
  // );

  // const sftOwnerTokenAccount = await createAssociatedTokenAccount(
  //   connection,
  //   wallet,
  //   sftMint,
  //   sftOwner.publicKey
  // );

  // await mintTo(
  //   connection,
  //   wallet,
  //   sftMint,
  //   sftOwnerTokenAccount,
  //   wallet,
  //   mintAmount
  // );

  const mintKeypair = Keypair.generate();

  const metaplexInstance = Metaplex.make(connection).use(keypairIdentity(wallet));

  const { mint } = await metaplexInstance
    .tokens()
    .createMint({
      mint: mintKeypair,
      decimals: 0,
      mintAuthority: wallet.publicKey,
      freezeAuthority: wallet.publicKey,
      payer: wallet
    })
    .run();

  const { token } = await metaplexInstance
    .tokens()
    .createToken({
      mint: mint.address,
      owner: sftOwner.publicKey,
      payer: wallet
    })
    .run();

  await metaplexInstance
    .tokens()
    .mintTokens({
      mint,
      destination: token.address,
      amount: {
        basisPoints: toBigNumber(mintAmount),
        currency: {
          decimals: 0,
          symbol: ''
        }
      }
    })
    .run();

  // const { metadataAddress, masterEditionAddress } = await metaplexInstance
  //   .nfts()
  //   .create({
  //     uri: '',
  //     name: '',
  //     mint: mintKeypair,
  //     sellerFeeBasisPoints: 200,
  //     payer: wallet,
  //     owner: sftOwner.publicKey,
  //     mintAuthority: wallet
  //   })
  //   .run();

  const [metadataAddress] = await getMetadataAccount(mint.address);

  const metadataTx = new metaplexJS.programs.metadata.CreateMetadata(
    { feePayer: wallet.publicKey },
    {
      metadata: metadataAddress,
      metadataData: new metaplexJS.programs.metadata.MetadataDataData({
        name: '',
        symbol: '',
        uri: '',
        sellerFeeBasisPoints: 1,
        creators: null
      }),
      updateAuthority: wallet.publicKey,
      mint: mint.address,
      mintAuthority: wallet.publicKey
    }
  );

  const transaction = new Transaction();
  transaction.add(...metadataTx.instructions);

  await sendAndConfirmTransaction(connection, transaction, [wallet]);

  return {
    sftMint: mint.address,
    sftOwnerTokenAccount: token.address,
    metadataAddress
  };
};

export const initWhitelistToken = async (authority: Keypair, connection: Connection): Promise<PublicKey> => {
  const metaplexInstance = Metaplex.make(connection).use(keypairIdentity(authority));

  const { mintSigner } = await metaplexInstance
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
  const metaplexInstance = Metaplex.make(connection).use(keypairIdentity(authority));

  await metaplexInstance
    .tokens()
    .mintTokens({
      mint,
      destination: receiver,
      mintAuthority: authority,
      amount: {
        basisPoints: toBigNumber(1),
        currency: {
          symbol: '',
          decimals: 0
        }
      }
    })
    .run();
};
