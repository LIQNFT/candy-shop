import { web3 } from '@project-serum/anchor';
import { parseMetadata } from './parseData';
import * as crc32 from 'crc-32';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const metadataProgramId = new web3.PublicKey(METADATA_PROGRAM_ID);

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
    [
      Buffer.from('metadata'),
      metadataProgramId.toBuffer(),
      new web3.PublicKey(mintAddress).toBuffer()
    ],
    metadataProgramId
  );
  const newEditionMetadataAccountInfo = await connection.getAccountInfo(
    newEditionMetadata
  );
  const metadata = parseMetadata(newEditionMetadataAccountInfo!.data).data;

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

export const getIdentifier = async (
  mintAddress: string,
  connection: web3.Connection
): Promise<void> => {
  try {
    const { symbol, creators, metadataAddress } =
      await getTokenMetadataByMintAddress(mintAddress, connection);
    const str = symbol + JSON.stringify(creators);
    const identifier = crc32.str(str);
    console.log('metadata', metadataAddress);
    console.log('creators', JSON.stringify(creators));
    console.log('symbol', symbol);
    console.log('identifier', identifier);
    console.log('metadataAddress', metadataAddress);
  } catch (e) {
    console.error(e);
  }
};
