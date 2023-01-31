export interface NftCreator {
  address: string;
  share: number;
  verified?: number;
}

export interface NftFiles {
  uri: string;
  type: string;
}

export interface NftProperties {
  files: NftFiles[];
  category: string;
  creators: NftCreator[];
}

export interface NftAttribute {
  value: string;
  trait_type: string;
}

export interface Nft {
  mint: string;
  nftUri?: string;
  name: string;
  symbol: string;
  description?: string;
  sellerFeeBasisPoint: number;
  image?: string;
  animationUrl?: string;
  attributes?: NftAttribute[];
  externalUri?: string;
  properties?: NftProperties;
}

export interface WhitelistNft {
  candyShopAddress: string;
  tokenMint: string;
  creators: NftCreator[];
  symbol: string;
  identifier: string;
  collectionId: string;
  createdAt: Date;
}

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

export interface NftStats {
  pastPrices: string[];
  highestPrice: string;
  lowestPrice: string;
}
