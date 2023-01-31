import { CommonQuery, SortBy } from '../commonQuery';
import { NftAttributeQuery } from '../nft';
import { DropStatus } from './DropResponse';

export interface DropQuery extends CommonQuery {
  status?: DropStatus[];
  creator?: string;
  nftMint?: string;
  nftName?: string;
  collectionKey?: string;
  attributes?: NftAttributeQuery[];
  sortBy?: SortBy[] | SortBy;
}

export interface DropActivityQuery extends CommonQuery {
  walletAddress: string;
}
