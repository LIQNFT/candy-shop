import { NftAttribute, NftProperties } from '../nft';

export enum DropType {
  Editioned = 0
}

export enum VaultStatus {
  CREATED = 0,
  WHITELIST_STARTED = 1,
  SALE_STARTED = 2,
  SALE_COMPLETED = 3
}

export interface Drop {
  vaultAddress: string;
  type: DropType;
  shopId: string;
  price: string;
  maxSupply: number;
  currentSupply: number;
  startTime: string;
  whitelistTime: string | null;
  whitelistMint: string | null;
  nftMint: string;
  txHashAtCreation: string;
  blockTimeAtCreation: string;
  nftTokenAccount: string;
  firstSalesPeriod: string;
  programId: String;
  createdAt: Date;
  updatedAt: Date;
  status: VaultStatus;

  // Nft Info
  nftUri?: string;
  name?: string;
  symbol?: string;
  description?: string;
  sellerFeeBasisPoint?: number;
  image?: string;
  attributes?: NftAttribute[];
  externalUri?: string;
  properties?: NftProperties;
}
