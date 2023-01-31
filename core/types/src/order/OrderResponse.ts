import { NftAttribute, NftCreator, NftProperties } from '../nft';
import { Blockchain } from '../commonQuery';

export enum Side {
  BUY,
  SELL
}

export enum Status {
  OPEN,
  FILLED,
  UNEXECUTABLE,
  CANCELLED,
  PENDING_FILLED,
  PENDING_CANCELLED
}

export interface Order {
  side: Side;
  blockchain: Blockchain;
  // NFT collection name, e.g. SMB
  ticker: string;
  verifiedNftCollection: number;
  // Name of the NFT listed in the order
  name: string;
  price: string;
  amount: string;
  // TokenId
  edition: number | null;
  tokenAccount: string;
  metadata: string;
  // Mint Address
  tokenMint: string;
  nftDescription: string;
  programId: string;
  updatedAt: string;
  createdAt: string;
  // link to find more description of the NFT,
  // e.g. "https://arweave.net/rB039m8EdmcngPmlUgiXg6X_v7wOKBPPHWuP0dLZpro"
  // in https://explorer.solana.com/address/62EhPTBsBtWwkLu8pV6oTVJEuzpJSwYp2XGD4RQaFxW5/metadata
  nftUri: string;
  nftImageLink: string | null;
  nftAnimationLink: string | null;
  nftCreators: NftCreator[];
  nftSellerFeeBasisPoint?: number;
  nftAttributes?: NftAttribute[];
  nftExternalUri?: string;
  nftProperties?: NftProperties;
  tradeState: string;
  status: Status;
  // Current owner

  walletAddress: string;
  txHash: string;

  // Candy Shop information
  treasuryMint: string;
  candyShopCreatorAddress: string;
  symbol: string;
  decimals: number;
}

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
  shopSymbol: string;
  createdAt: Date;
}
