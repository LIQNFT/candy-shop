import { NftAttribute, NftProperties } from '../nft';

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
