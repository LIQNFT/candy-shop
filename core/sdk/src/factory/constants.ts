import { web3 } from '@project-serum/anchor';

export const WRAPPED_SOL_MINT = new web3.PublicKey('So11111111111111111111111111111111111111112');

export const AUCTION_HOUSE_PROGRAM_ID = new web3.PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk');

export const LIQNFT_TREASURY_ACCOUNT = new web3.PublicKey('91jjF761KfDyXE6uFRe3zyRESPwQtewo8hxHc3yFQaRF');

export const CANDY_SHOP_PROGRAM_ID = new web3.PublicKey('csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN');

export const CANDY_SHOP_V2_PROGRAM_ID = new web3.PublicKey('csbMUULiQfGjT8ezT16EoEBaiarS6VWRevTw1JMydrS');

export const COMPUTE_BUDGET_PROGRAM_ID = new web3.PublicKey('ComputeBudget111111111111111111111111111111');

export const BID = 'bid';
export const WALLET = 'wallet';

export const AUCTION = 'auction';
export const AUCTION_HOUSE = 'auction_house';

export const FEE_PAYER = 'fee_payer';
export const TREASURY = 'treasury';

export const CANDY_STORE = 'candy_shop';
export const AUTHORITY = 'authority';

export const ORDER = 'order';
export type Side = 'sell' | 'buy';

export const FEE_ACCOUNT_MIN_BAL = 0.05 * web3.LAMPORTS_PER_SOL;

export const NATIVE_CREATORS_LIMIT = 5;
export const SPL_CREATORS_LIMIT = 2;
