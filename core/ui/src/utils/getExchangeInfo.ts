import { CandyShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from 'model';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';

export function getExchangeInfo(order: OrderSchema | undefined, candyShop: CandyShop): ShopExchangeInfo {
  return {
    symbol: order?.symbol ?? candyShop.currencySymbol,
    decimals: order?.decimals ?? candyShop.currencyDecimals
  };
}
