import { NftCreator } from '../nft';

export interface WhitelistNft {
  candyShopAddress: string;
  tokenMint: string;
  creators: NftCreator[];
  symbol: string;
  identifier: string;
  collectionId: number;
  createdAt: Date;
}
