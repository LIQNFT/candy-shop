export interface NftCollection {
  id: string;
  candyShopAddress: string;
  name: string;
  ticker: string;
  image: string;
  category: string[];
  description: string;
  identifiers?: number;
  createdAt: Date;
  updatedAt: Date;
}
