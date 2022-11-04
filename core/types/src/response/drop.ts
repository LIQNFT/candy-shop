import { NftAttribute, NftProperties } from '../nft';

export enum DropType {
  Editioned = 0
}

export enum DropStatus {
  CREATED = 0,
  WHITELIST_STARTED = 1,
  SALE_STARTED = 2,
  SALE_COMPLETED = 3
}

export interface Drop {
  vaultAddress: string;
  description?: string;
  creator: string;
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
  salesPeriod: string;
  programId: string;
  createdAt: string;
  updatedAt: string;
  status: DropStatus;

  // Nft Info
  nftUri?: string;
  nftName?: string;
  nftSymbol?: string;
  nftDescription?: string;
  nftSellerFeeBasisPoint?: number;
  nftImage?: string;
  nftAttributes?: NftAttribute[];
  nftExternalUri?: string;
  nftAnimationUrl?: string;
  nftProperties?: NftProperties;
}
