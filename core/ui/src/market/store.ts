import { CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { EthWallet, ShopProps } from 'model';
import { Store } from './catalog';
import { EthStore } from './EthStore';
import { SolStore } from './SolStore';

export const StoreProvider = ({ candyShop, wallet }: ShopProps): Store => {
  if (candyShop instanceof EthCandyShop) {
    return new EthStore(candyShop as EthCandyShop, wallet as EthWallet);
  }
  const solShop: CandyShop = candyShop as CandyShop;
  return new SolStore(solShop, wallet as AnchorWallet, solShop.connection, solShop.isEnterprise);
};
