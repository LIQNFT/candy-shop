import { Blockchain } from '../query';

export interface CandyShop {
  candyShopAddress: string;
  candyShopName: string;
  programId: string;
  treasuryAddress: string;
  treasuryMint: string;
  feeAccountAddress: string;
  feeSplit: number;
  feeRate: number;
  symbol: string;
  decimals: number;
  logoURI: string;
  txHashAtCreation: string;
  allowSellAnyNft: number;
  imageUrl: string;
  websiteUrl: string;
  discordUrl: string;
  twitterUrl: string;
  blockchain: Omit<Blockchain, 'devnet' | 'mainnet-beta'>;
}
