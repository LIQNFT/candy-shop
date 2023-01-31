import { CommonQuery, SortBy } from '../commonQuery';
import { AuctionStatus } from './AuctionResponse';

export interface AuctionBidQuery extends CommonQuery {
  orderByArr?: SortBy;
}

export type AuctionQuery = {
  offset?: number;
  limit?: number;
  status?: AuctionStatus[];
  walletAddress?: string;
};
