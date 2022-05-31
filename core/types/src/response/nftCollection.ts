export interface NftCollection {
  id: number;
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
