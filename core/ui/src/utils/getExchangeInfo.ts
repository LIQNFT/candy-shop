import { CandyShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from 'model';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';

interface ShopInfo {
  currencySymbol: string;
  currencyDecimals: number;
}

export function getExchangeInfo(order: OrderSchema | undefined, candyShop: CandyShop | ShopInfo): ShopExchangeInfo {
  return {
    symbol: order?.symbol ?? candyShop.currencySymbol,
    decimals: order?.decimals ?? candyShop.currencyDecimals
  };
}
