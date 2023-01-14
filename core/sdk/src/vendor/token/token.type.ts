import { Metadata } from '../../factory/conveyor/sol/parseData';

export interface RawTokenInfo {
  account: any;
  uri?: any;
  tokenMint: string;
  tokenPubkey: string;
  metadata?: Metadata;
  edition?: string;
  amount: string;
}

export interface EditionDrop {
  amount: string;
  edition: string;
  maxSupply: number;
  nftImage: string;
  tokenAccountAddress: string;
  tokenMintAddress: string;
  nftDescription: string;
  name: string;
  symbol: string;
}
