import { getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { web3 } from "@project-serum/anchor";
import axios from 'axios';
import { Metadata, parseEdition, parseMetadata } from '../utils/parseData';
import { safeAwait } from '../utils/PromiseHelper';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const metadataProgramId = new web3.PublicKey(METADATA_PROGRAM_ID);

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
  connection: web3.Connection,
  tokenAccountAddress: string
): Promise<SingleTokenInfo | null> => {
  // Get account
  const token = await getAccount(
    connection,
    new web3.PublicKey(tokenAccountAddress)
  );
  const [newEditionMetadata] = await web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      metadataProgramId.toBuffer(),
      token.mint.toBuffer(),
    ],
    metadataProgramId
  );
  const [newEditionPublicKey] = await web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      metadataProgramId.toBuffer(),
      token.mint.toBuffer(),
      Buffer.from('edition'),
    ],
    metadataProgramId
  );

  const newEditionMetadataAccountInfoResult = await safeAwait(
    connection.getAccountInfo(newEditionMetadata)
  );
  if (newEditionMetadataAccountInfoResult.error) {
    console.log('rate limited');
  }
  const newEditionMetadataAccountInfo =
    newEditionMetadataAccountInfoResult.result;

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

  if (tokenInfo) {
    return axios
      .get(tokenInfo.data.uri)
      .then((res) => {
        const nftUriData = res.data as any;
        const nftImage = nftUriData.image;
        const nftAnimation: string | undefined = nftUriData.animation_url;
        const nftDescription = nftUriData.description;

        return {
          tokenAccountAddress: tokenAccountAddress,
          metadata: tokenInfo,
          edition: tokenEdition,
          tokenMintAddress: token.mint.toString(),
          nftImage,
          nftAnimation,
          nftDescription,
        };
      })
      .catch((err) => {
        console.log('failed to fetch uri data');
        console.log(err);
        return null;
      });
  } else {
    console.log(`tokenAccount ${tokenAccountAddress} does not have metadata`);
    return null;
  }
};
