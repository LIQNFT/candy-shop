import { getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { Metadata, parseEdition, parseMetadata } from '../utils/parseData';
import { safeAwait } from '../utils/PromiseHelper';

export type SingleTokenInfo = {
  tokenAccountAddress: string;
  metadata: Metadata | undefined;
  edition: string | undefined;
  tokenMintAddress: string;
  nftImage: string;
  nftAnimation: string | undefined;
  nftDescription: string;
};

export const singleTokenInfoPromise = async (
  connection: Connection,
  tokenAccountAddress: string
): Promise<SingleTokenInfo | null> => {
  // Get account
  const token = await getAccount(
    connection,
    new PublicKey(tokenAccountAddress)
  );
  const [newEditionMetadata] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_PROGRAM_ID.toBuffer(),
      token.mint.toBuffer(),
    ],
    TOKEN_PROGRAM_ID
  );
  const [newEditionPublicKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_PROGRAM_ID.toBuffer(),
      token.mint.toBuffer(),
      Buffer.from('edition'),
    ],
    TOKEN_PROGRAM_ID
  );

  const newEditionMetadataAccountInfoResult = await safeAwait(
    connection.getAccountInfo(newEditionMetadata)
  );
  if (newEditionMetadataAccountInfoResult.error) {
    console.log('rate limited');
  }
  const newEditionMetadataAccountInfo =
    newEditionMetadataAccountInfoResult.result;

  // metadata account does not exist, i.e. not NFT
  if (newEditionMetadataAccountInfo === null) return null;

  const newEditionAccountInfoResult = await safeAwait(
    connection.getAccountInfo(newEditionPublicKey)
  );
  if (newEditionAccountInfoResult.error) {
    console.log('rate limited');
  }
  const newEditionAccountInfo = newEditionAccountInfoResult.result;

  const tokenInfo = newEditionMetadataAccountInfo
    ? parseMetadata(newEditionMetadataAccountInfo.data)
    : undefined;
  const tokenEdition = newEditionAccountInfo
    ? parseEdition(newEditionAccountInfo?.data).edition.toString()
    : undefined;

  let nftImage;
  let nftAnimation: string | undefined;
  let nftDescription;
  try {
    const res = await axios.get(tokenInfo!.data.uri);
    const nftUriData = res.data as any;
    nftImage = nftUriData.image;
    nftAnimation = nftUriData.animation_url;
    nftDescription = nftUriData.description;
  } catch (e) {
    console.log(`failed to get nftUri from tokenInfo: ${tokenInfo}`);
    console.log(e);
  }

  return {
    tokenAccountAddress: tokenAccountAddress,
    metadata: tokenInfo,
    edition: tokenEdition,
    tokenMintAddress: token.mint.toString(),
    nftImage,
    nftAnimation,
    nftDescription,
  };
};
