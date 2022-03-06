import * as anchor from "@project-serum/anchor";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
    AUCTION_HOUSE, AUCTION_HOUSE_PROGRAM_ID, AUTHORITY, CANDY_STORE, FEE_PAYER,
    TREASURY
} from "./constants";


export const getAuctionHouse = async (
  creator: PublicKey,
  treasuryMint: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), creator.toBuffer(), treasuryMint.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseAuthority = async (
  creator: PublicKey,
  marketProgramId: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), Buffer.from(AUTHORITY)],
    marketProgramId
  );
};

export const getCandyShop = async (
  creator: PublicKey,
  marketProgramId: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer()],
    marketProgramId
  );
};

export const getAuctionHouseProgramAsSigner = (): Promise<
  [PublicKey, number]
> => {
  return PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), Buffer.from("signer")],
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
): Promise<[PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      tokenAccount.toBuffer(),
      treasuryMint.toBuffer(),
      tokenMint.toBuffer(),
      buyPrice.toBuffer("le", 8),
      tokenSize.toBuffer("le", 8),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseFeeAcct = async (
  auctionHouse: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      Buffer.from(FEE_PAYER),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTreasuryAcct = async (
  auctionHouse: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      Buffer.from(TREASURY),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseEscrow = async (
  auctionHouse: PublicKey,
  wallet: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAtaForMint = async (
  mint: PublicKey,
  buyer: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};
