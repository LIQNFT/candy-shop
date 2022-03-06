import { PublicKey } from "@solana/web3.js";

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const AUCTION_HOUSE_PROGRAM_ID = new PublicKey(
  "hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk"
);

export const AUCTION_HOUSE = "auction_house";

export const FEE_PAYER = "fee_payer";
export const TREASURY = "treasury";

export const CANDY_STORE = "candy_shop";
export const AUTHORITY = "authority";

export const ORDER = "order";
export type Side = "sell" | "buy";
