export interface Trade {
  ticker: string;
  price: string;
  amount: string;
  edition: number | null;
  tokenAccount: string;
  tokenMint: string;
  sellerAddress: string;
  buyer: string;
  buyerAddress: string;
  txHashAtCreation: string;
  nftName: string;
  nftImageUrl: string;
  createdAt: Date;
}
