export interface SortBy {
  column: string;
  order: 'asc' | 'desc';
}

export interface CommonQuery {
  offset?: number;
  limit?: number;
}

export enum Blockchain {
  Sol = 'SOL',
  SolDevnet = 'devnet',
  SolMainnetBeta = 'mainnet-beta',
  Eth = 'ETH',
  EthTestnet = 'GOERLI',
  Polygon = 'MATIC',
  PolygonTestnet = 'MUMBAI'
}
