export interface ShopStats {
  floorPrice: string | null;
  totalVolume: string;
  averageSalesPrice: string | null;
  totalListed: string;
}

export interface NftStats {
  pastPrices: string[];
  highestPrice: string;
  lowestPrice: string;
}
