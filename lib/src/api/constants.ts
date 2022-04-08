import { web3 } from "@project-serum/anchor"

export const WRAPPED_SOL_MINT = new web3.PublicKey(
  'So11111111111111111111111111111111111111112'
);

export const AUCTION_HOUSE_PROGRAM_ID = new web3.PublicKey(
  'hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk'
);

export const LIQNFT_TREASURY_ACCOUNT = new web3.PublicKey(
  '91jjF761KfDyXE6uFRe3zyRESPwQtewo8hxHc3yFQaRF'
);

export const AUCTION_HOUSE = 'auction_house';

export const FEE_PAYER = 'fee_payer';
export const TREASURY = 'treasury';

export const CANDY_STORE = 'candy_shop';
export const AUTHORITY = 'authority';

export const ORDER = 'order';
export type Side = 'sell' | 'buy';
