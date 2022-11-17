import { web3 } from '@project-serum/anchor';
import { Account, getAccount } from '@solana/spl-token';
import axios from 'axios';
import * as crc32 from 'crc-32';
import { CandyShopError, CandyShopErrorType } from '../error';
import { safeAwait } from '../utils/promiseUtils';
import { Metadata, parseEdition, parseMetadata } from './parseData';
import { TOKEN_METADATA_PROGRAM_ID } from '../../factory/constants';

interface NFTMetadataInfo {
  nftImage: string;
  nftAnimation: string | undefined;
  nftDescription: string;
}

export interface SingleTokenInfo {
  // used for EVM assets, can also be used for Solana in the future
  itemType?: 'ERC721' | 'ERC1155';
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
  identifiers: string[] | undefined;
}

interface NftMetadataCreator {
  address: string;
  share: number;
  verified: number;
}

export interface NftMetadata {
  symbol: string;
  creators: NftMetadataCreator[];
  metadataAddress: string;
  sellerFeeBasisPoints: number;
}

export const getTokenMetadataByMintAddress = async function (
  mintAddress: string,
  connection: web3.Connection
): Promise<NftMetadata> {
  const [newEditionMetadata] = await web3.PublicKey.findProgramAddress(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), new web3.PublicKey(mintAddress).toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );
  const newEditionMetadataAccountInfo = await safeAwait(connection.getAccountInfo(newEditionMetadata));
  if (newEditionMetadataAccountInfo.error || !newEditionMetadataAccountInfo.result) {
    throw new CandyShopError(CandyShopErrorType.InvalidNFTMetadata);
  }
  const metadata = parseMetadata(newEditionMetadataAccountInfo.result.data).data;

  return {
    // @ts-ignore
    creators: metadata.creators?.map((creator) => ({
      address: new web3.PublicKey(creator.address).toString(),
      verified: creator.verified,
      share: creator.share
    })),
    symbol: metadata.symbol,
    metadataAddress: newEditionMetadata.toString(),
    sellerFeeBasisPoints: metadata.sellerFeeBasisPoints
  };
};

export const singleTokenInfoPromise = async (param: SingleTokenInfoPromiseParam): Promise<SingleTokenInfo | null> => {
  const connection = param.connection;
  const tokenAccountAddress = param.tokenAccountAddress;
  const identifiers = param.identifiers;

  const tokenAccount = await getAccount(connection, new web3.PublicKey(tokenAccountAddress));
  const tokenInfo = await getNFTMetadataAccountInfo(connection, tokenAccount);
  if (!tokenInfo) {
    console.log(`singleTokenInfoPromise: tokenAccount ${tokenAccountAddress} does not have metadata`);
    return null;
  }

  if (!isValidWhitelistNft(identifiers, tokenInfo)) {
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
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenAccount.mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );
  const nftMetadataAccountInfo = await safeAwait(connection.getAccountInfo(nftMetadataPublicKey));
  if (nftMetadataAccountInfo.error) {
    throw new CandyShopError(CandyShopErrorType.FailToFetchOnchainAccount);
  }

  const tokenInfo = nftMetadataAccountInfo.result ? parseMetadata(nftMetadataAccountInfo.result.data) : undefined;
  return tokenInfo;
};

const getNFTEditionInfo = async (connection: web3.Connection, tokenAccount: Account): Promise<any> => {
  const [nftEditionPublicKey] = await web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      tokenAccount.mint.toBuffer(),
      Buffer.from('edition')
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const nftEditionAccountInfo = await safeAwait(connection.getAccountInfo(nftEditionPublicKey));
  if (nftEditionAccountInfo.error) {
    throw new CandyShopError(CandyShopErrorType.FailToFetchOnchainAccount);
  }

  const editionInfo = nftEditionAccountInfo.result
    ? parseEdition(nftEditionAccountInfo.result.data).edition.toString()
    : undefined;
  return editionInfo;
};

const fetchMetadataInfoByUri = async (nftUri: string): Promise<NFTMetadataInfo | null> => {
  const res = await safeAwait(axios.get(nftUri));
  if (res.error) {
    console.log('singleTokenInfoPromise: Failed to fetch uri data, error=', res.error);
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

export const isValidWhitelistNft = (identifiers: string[] | undefined, tokenInfo: Metadata) => {
  if (identifiers === undefined) return true;
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
