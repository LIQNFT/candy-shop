import { web3 } from '@project-serum/anchor';
import { Account, getAccount } from '@solana/spl-token';
import axios from 'axios';
import * as crc32 from 'crc-32';
import { safeAwait } from './promiseUtils';
import { Metadata, parseEdition, parseMetadata } from './parseData';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const MetadataProgramPubkey = new web3.PublicKey(METADATA_PROGRAM_ID);

interface NFTMetadataInfo {
  nftImage: string;
  nftAnimation: string | undefined;
  nftDescription: string;
}

export interface SingleTokenInfo {
  tokenAccountAddress: string;
  metadata: Metadata | undefined;
  edition: string | undefined;
  tokenMintAddress: string;
  nftImage: string;
  nftAnimation: string | undefined;
  nftDescription: string;
}

// TODO: we will need extendable singleTokenInfoPromise that can apply different param
export interface SingleTokenInfoPromiseParam {
  connection: web3.Connection;
  tokenAccountAddress: string;
  identifiers: string[];
}

export const singleTokenInfoPromise = async (
  param: SingleTokenInfoPromiseParam
): Promise<SingleTokenInfo | null> => {
  const connection = param.connection;
  const tokenAccountAddress = param.tokenAccountAddress;
  const identifiers = param.identifiers;

  const tokenAccount = await getAccount(
    connection,
    new web3.PublicKey(tokenAccountAddress)
  );
  const tokenInfo = await getNFTMetadataAccountInfo(connection, tokenAccount);
  if (!tokenInfo) {
    console.log(
      `singleTokenInfoPromise: tokenAccount ${tokenAccountAddress} does not have metadata`
    );
    return null;
  }

  if (identifiers.length > 0 && !isValidCollection(identifiers, tokenInfo)) {
    return null;
  }
  const nftMetaDataInfo = await fetchMetadataInfoByUri(tokenInfo.data.uri);

  if (!nftMetaDataInfo) {
    return null;
  }
  const tokenEdition = await getNFTEditionInfo(connection, tokenAccount);
  const singleTokenInfo: SingleTokenInfo = {
    tokenAccountAddress: tokenAccountAddress,
    metadata: tokenInfo,
    edition: tokenEdition,
    tokenMintAddress: tokenAccount.mint.toString(),
    nftImage: nftMetaDataInfo.nftImage,
    nftAnimation: nftMetaDataInfo.nftAnimation,
    nftDescription: nftMetaDataInfo.nftDescription
  };
  return singleTokenInfo;
};

const getNFTMetadataAccountInfo = async (
  connection: web3.Connection,
  tokenAccount: Account
): Promise<Metadata | undefined> => {
  const [nftMetadataPublicKey] = await web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      MetadataProgramPubkey.toBuffer(),
      tokenAccount.mint.toBuffer()
    ],
    MetadataProgramPubkey
  );
  const nftMetadataAccountInfo = await safeAwait(
    connection.getAccountInfo(nftMetadataPublicKey)
  );
  if (nftMetadataAccountInfo.error) {
    // TODO: handle the error correctly
    console.log('rate limited');
  }

  const tokenInfo = nftMetadataAccountInfo.result
    ? parseMetadata(nftMetadataAccountInfo.result.data)
    : undefined;
  return tokenInfo;
};

const getNFTEditionInfo = async (
  connection: web3.Connection,
  tokenAccount: Account
): Promise<any> => {
  const [nftEditionPublicKey] = await web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      MetadataProgramPubkey.toBuffer(),
      tokenAccount.mint.toBuffer(),
      Buffer.from('edition')
    ],
    MetadataProgramPubkey
  );

  const nftEditionAccountInfo = await safeAwait(
    connection.getAccountInfo(nftEditionPublicKey)
  );
  if (nftEditionAccountInfo.error) {
    // TODO: handle the error correctly
    console.log('rate limited');
  }

  const editionInfo = nftEditionAccountInfo.result
    ? parseEdition(nftEditionAccountInfo.result.data).edition.toString()
    : undefined;
  return editionInfo;
};

const fetchMetadataInfoByUri = async (
  nftUri: string
): Promise<NFTMetadataInfo | null> => {
  const res = await safeAwait(axios.get(nftUri));
  if (res.error) {
    console.log(
      'singleTokenInfoPromise: Failed to fetch uri data, error=',
      res.error
    );
    return null;
  }
  const nftUriData = res.result.data as any;
  const nftImage = nftUriData.image;
  const nftAnimation: string | undefined = nftUriData.animation_url;
  const nftDescription = nftUriData.description;

  const nftMetaDataInfo: NFTMetadataInfo = {
    nftImage: nftImage,
    nftAnimation: nftAnimation,
    nftDescription: nftDescription
  };
  return nftMetaDataInfo;
};

const isValidCollection = (identifiers: string[], tokenInfo: Metadata) => {
  const creators = tokenInfo.data.creators?.map((creator) => ({
    address: new web3.PublicKey(creator.address).toString(),
    verified: creator.verified,
    share: creator.share
  }));
  const symbol = tokenInfo.data.symbol;
  const str = symbol + JSON.stringify(creators);
  const identifier = crc32.str(str).toString();
  return identifiers.includes(identifier);
};
