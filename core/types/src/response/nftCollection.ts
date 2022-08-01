import { WhitelistNft } from './whitelistNft';

export interface NftCollection {
  id: string;
  candyShopAddress: string;
  name: string;
  ticker: string;
  image: string;
  category: string[];
  description: string;
  identifiers?: number;
  identifierList?: Pick<WhitelistNft, 'tokenMint' | 'symbol' | 'creators' | 'identifier'>[];
  createdAt: Date;
  updatedAt: Date;
}
