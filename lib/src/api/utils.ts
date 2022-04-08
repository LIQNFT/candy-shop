import * as anchor from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  AUCTION_HOUSE,
  AUCTION_HOUSE_PROGRAM_ID,
  AUTHORITY,
  CANDY_STORE,
  FEE_PAYER,
  TREASURY,
} from './constants';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const metadataProgramId = new anchor.web3.PublicKey(METADATA_PROGRAM_ID);

export const getAuctionHouse = async (
  authority: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), authority.toBuffer(), treasuryMint.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseAuthority = async (
  creator: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  marketProgramId: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(CANDY_STORE),
      creator.toBuffer(),
      treasuryMint.toBuffer(),
      Buffer.from(AUTHORITY),
    ],
    marketProgramId
  );
};

export const getCandyShop = async (
  creator: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  marketProgramId: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer()],
    marketProgramId
  );
};

export const getCandyShopSync = (
  creator: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  marketProgramId: anchor.web3.PublicKey
): [anchor.web3.PublicKey, number] => {
  return findProgramAddressSync(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer()],
    marketProgramId
  );
};

export const getAuctionHouseProgramAsSigner = (): Promise<
  [anchor.web3.PublicKey, number]
> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), Buffer.from('signer')],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTradeState = async (
  auctionHouse: anchor.web3.PublicKey,
  wallet: anchor.web3.PublicKey,
  tokenAccount: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  tokenMint: anchor.web3.PublicKey,
  tokenSize: anchor.BN,
  buyPrice: anchor.BN
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      tokenAccount.toBuffer(),
      treasuryMint.toBuffer(),
      tokenMint.toBuffer(),
      buyPrice.toArrayLike(Buffer, 'le', 8),
      tokenSize.toArrayLike(Buffer, 'le', 8),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseFeeAcct = async (
  auctionHouse: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      Buffer.from(FEE_PAYER),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTreasuryAcct = async (
  auctionHouse: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      Buffer.from(TREASURY),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseEscrow = async (
  auctionHouse: anchor.web3.PublicKey,
  wallet: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

export async function getMetadataAccount(tokenMint: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      metadataProgramId.toBuffer(),
      tokenMint.toBuffer(),
    ],
    metadataProgramId
  );
}
