import { Side, Status, ShopStatusType, DropStatus, AuctionStatus } from '../response';

export interface NftAttributeQuery {
  [trait_type: string]: string;
}

export interface SortBy {
  column: string;
  order: 'asc' | 'desc';
}

export interface OrderSortBy extends SortBy {}

type attributeType = { [key: string]: string };

interface CommonQuery {
  offset?: number;
  limit?: number;
}

export interface OrdersFilterQuery extends CommonQuery {
  sortBy?: SortBy | SortBy[];
  identifiers?: number[];
  sellerAddress?: string;
  attribute?: attributeType | attributeType[];
  candyShopAddress?: string;
  collectionId?: string;
  nftName?: string;
  masterEdition?: boolean;
}

export interface OrdersChildEditionFilterQuery extends CommonQuery {}

export interface TradeQuery extends CommonQuery {
  identifiers?: number[];
  sortBy?: SortBy[] | SortBy;
}

export interface OrderQs extends CommonQuery {
  filterArr?: OrderFilter[];
}

export interface OrderFilter {
  side: Side;
  status: Status;
  attribute?: NftAttributeQuery;
  candyShopAddress?: string;
}

export interface TradeQs extends CommonQuery {}

export interface ShopQs extends CommonQuery {}

export interface ShopStatusQuery {
  walletAddress?: string;
  targets?: ShopStatusType[];
}

export interface CollectionQuery extends CommonQuery {
  shopId?: string;
  name?: string;
}

export interface ShopQuery extends CommonQuery {
  name?: string;
}

export interface DropQuery extends CommonQuery {
  status?: DropStatus[];
  creator?: string;
  nftMint?: string;
  nftName?: string;
  attributes?: NftAttributeQuery[];
  sortBy?: SortBy[] | SortBy;
}

export interface DropActivityQuery extends CommonQuery {
  walletAddress: string;
}
export interface AuctionBidQuery extends CommonQuery {
  orderByArr?: SortBy;
}

export enum EvmChainQuery {
  ETH = 'eth',
  GOERLI = 'goerli',
  POLYGON = 'polygon',
  ROPSTEN = 'ropsten',
  RINKEBY = 'rinkeby',
  KOVAN = 'kovan',
  BSC = 'bsc',
  BSC_TESTNET = 'bsc_testnet',
  AVALANCHE = 'avalanche',
  FUJI = 'fuji',
  FANTOM = 'fantom',
  CRONOS = 'cronos',
  CRONOS_TESTNET = 'cronos_testnet',
  // polygon testnet
  MUMBAI = 'mumbai'
}

export interface FetchEvmWalletNftQuery {
  limit?: number;
  chain?: EvmChainQuery;
  cursor?: string;
}
export type AuctionQuery = {
  offset?: number;
  limit?: number;
  status?: AuctionStatus[];
  walletAddress?: string;
};
