import {
  Order as OrderSchema,
  Side,
  Status,
} from 'solana-candy-shop-schema/dist';

class CandyShopFake {
  stats() {
    return Promise.resolve({
      floorPrice: 10_000_000,
      totalListed: 4,
      totalVolume: 10_000_000,
    });
  }

  cancel() {
    return Promise.resolve({
      floorPrice: 10_000_000,
      totalListed: 4,
      totalVolume: 10_000_000,
    });
  }
}

export const candyShop = new CandyShopFake();

export const order: OrderSchema = {
  side: Side.BUY,
  ticker: 'string',
  name: 'Liquid #57',
  price: '100000000',
  amount: '1',
  edition: 0,
  tokenAccount: '8yRJB65ZT6pKFBWQkkN4WBdGzFtKmdvJNJcByMa6faBr',
  metadata: 'asdasd',
  tokenMint: '8yRJB65ZT6pKFBWQkkN4WBdGzFtKmdvJNJcByMa6faBr',
  nftDescription: '100 cyber puppies for testing purposes',
  nftUri: 'https://via.placeholder.com/728x90.png',
  nftImageLink:
    'https://d3r3rwhgo6ll35acgu4cl4qg5mpm5iykci3dnhkwrjj3gvhe.arweave.net/HuO42OZ3lr3-0AjU4-Jf_IG6x7OowoSNjadVopTs1Tk?ext=png',
  nftAnimationLink: 'string',
  tradeState: 'string',
  status: Status.OPEN,
  walletAddress: 'string',
  txHash: 'string',
};
