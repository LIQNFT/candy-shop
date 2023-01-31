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

export interface UserInputsSchema {
  name: string;
  required: boolean;
  label: string;
  type: 'text' | 'email';
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
  hasRedemption: boolean;
  userInputsSchema: UserInputsSchema[];

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

// activity
export interface DropActivity {
  walletAddress: string;
  edition: number;
  editionMint: string;
  txHashAtCreation: string;
}

// redemption
export interface DropRedemption {
  vaultAddress: string;
  editionMint: string;
  walletAddress: string;
  redemptionType: number;
  userInputs: string;
  qrStatus: boolean;
  status: RedemptionStatus;
  id: string;
}

export enum RedemptionType {
  Ticket
  // other types coming
}

export enum RedemptionStatus {
  Redeemable,
  Redeemed,
  UnRedeemable
}
