import { deserializeUnchecked } from 'borsh';
import { BN } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { safeAwait } from '../../../vendor/utils';
import { CandyShopError, CandyShopErrorType } from '../../../vendor/error';

// eslint-disable-next-line
const METADATA_REPLACE = new RegExp('\u0000', 'g');

export class Creator {
  address: PublicKey;
  verified: number;
  share: number;

  constructor(args: { address: PublicKey; verified: number; share: number }) {
    this.address = args.address;
    this.verified = args.verified;
    this.share = args.share;
  }
}

export enum MetadataKey {
  Uninitialized = 0,
  MetadataV1 = 4,
  EditionV1 = 1,
  MasterEditionV1 = 2,
  MasterEditionV2 = 6,
  EditionMarker = 7
}

export class MasterEditionV2 {
  key: MetadataKey;
  supply: BN;
  maxSupply?: BN;
  constructor(args: { key: MetadataKey; supply: BN; maxSupply?: BN }) {
    this.key = MetadataKey.MasterEditionV2;
    this.supply = args.supply;
    this.maxSupply = args.maxSupply;
  }
}

export class EditionMarker {
  key: MetadataKey;
  ledger: number[];
  constructor(args: { key: MetadataKey; ledger: number[] }) {
    this.key = MetadataKey.EditionMarker;
    this.ledger = args.ledger;
  }
}

export class Edition {
  key: MetadataKey;
  parent: PublicKey;
  edition: BN;
  constructor(args: { key: MetadataKey; parent: PublicKey; edition: BN }) {
    this.key = MetadataKey.EditionV1;
    this.parent = args.parent;
    this.edition = args.edition;
  }
}

export class Data {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Creator[] | null;
  constructor(args: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Creator[] | null;
  }) {
    this.name = args.name;
    this.symbol = args.symbol;
    this.uri = args.uri;
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
    this.creators = args.creators;
  }
}

export class Metadata {
  key: MetadataKey;
  updateAuthority: PublicKey;
  mint: PublicKey;
  data: Data;
  primarySaleHappened: boolean;
  isMutable: boolean;
  masterEdition?: PublicKey;
  edition?: PublicKey;
  editionNonce: number;
  tokenStandard: number;
  collection: Collection;
  constructor(args: {
    updateAuthority: PublicKey;
    mint: PublicKey;
    data: Data;
    primarySaleHappened: boolean;
    isMutable: boolean;
    masterEdition?: PublicKey;
    edition?: PublicKey;
    editionNonce: number;
    tokenStandard: number;
    collection: Collection;
  }) {
    this.key = MetadataKey.MetadataV1;
    this.updateAuthority = args.updateAuthority;
    this.mint = args.mint;
    this.data = args.data;
    this.primarySaleHappened = args.primarySaleHappened;
    this.isMutable = args.isMutable;
    this.editionNonce = args.editionNonce;
    this.tokenStandard = args.tokenStandard;
    this.collection = args.collection;
  }
}

export class Collection {
  verified: boolean;
  key: PublicKey;
  constructor(args: { verified: boolean; key: PublicKey }) {
    this.verified = args.verified;
    this.key = args.key;
  }
}

const METADATA_SCHEMA = new Map<any, any>([
  [
    MasterEditionV2,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['supply', 'u64'],
        ['maxSupply', { kind: 'option', type: 'u64' }]
      ]
    }
  ],
  [
    Edition,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['parent', [32]],
        ['edition', 'u64']
      ]
    }
  ],
  [
    Data,
    {
      kind: 'struct',
      fields: [
        ['name', 'string'],
        ['symbol', 'string'],
        ['uri', 'string'],
        ['sellerFeeBasisPoints', 'u16'],
        ['creators', { kind: 'option', type: [Creator] }]
      ]
    }
  ],
  [
    Creator,
    {
      kind: 'struct',
      fields: [
        ['address', [32]],
        ['verified', 'u8'],
        ['share', 'u8']
      ]
    }
  ],
  [
    Metadata,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['updateAuthority', [32]],
        ['mint', [32]],
        ['data', Data],
        ['primarySaleHappened', 'u8'],
        ['isMutable', 'u8'],
        ['editionNonce', { kind: 'option', type: 'u8' }],
        ['tokenStandard', { kind: 'option', type: 'u8' }],
        ['collection', { kind: 'option', type: Collection }]
      ]
    }
  ],
  [
    Collection,
    {
      kind: 'struct',
      fields: [
        ['verified', 'u8'],
        ['key', [32]]
      ]
    }
  ],
  [
    EditionMarker,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['ledger', [31]]
      ]
    }
  ]
]);

export const parseMasterEditionV2 = (buffer: Buffer) => {
  if (buffer.at(0) !== MetadataKey.MasterEditionV2) return null;
  return deserializeUnchecked(METADATA_SCHEMA, MasterEditionV2, buffer) as MasterEditionV2;
};

export const parseMetadata = (buffer: Buffer): Metadata => {
  const metadata = deserializeUnchecked(METADATA_SCHEMA, Metadata, buffer) as Metadata;
  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '');
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '');
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '');
  return metadata;
};

export const parseEditionMarker = (buffer: Buffer): EditionMarker => {
  const editionMarker = deserializeUnchecked(METADATA_SCHEMA, EditionMarker, buffer) as EditionMarker;
  return editionMarker;
};

export const parseNftUpdateAuthority = async (
  metadataAddress: PublicKey,
  connection: Connection
): Promise<PublicKey> => {
  const metadataAccount = await safeAwait(connection.getAccountInfo(metadataAddress));
  if (metadataAccount.error || !metadataAccount.result) {
    throw new CandyShopError(CandyShopErrorType.NodeRequestFailed);
  }

  const metadata = parseMetadata(metadataAccount.result.data);
  return new PublicKey(metadata.updateAuthority);
};

export const parseEdition = (buffer: Buffer) => {
  if (buffer.at(0) !== MetadataKey.EditionV1) return null;
  const parsedData = deserializeUnchecked(METADATA_SCHEMA, Edition, buffer) as Edition;
  return parsedData;
};
