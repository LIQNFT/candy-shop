import { BaseShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from 'model';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';

export const getDefaultExchange = (candyShop: {
  currencySymbol: string;
  currencyDecimals: number;
}): ShopExchangeInfo => ({
  symbol: candyShop.currencySymbol,
  decimals: candyShop.currencyDecimals
});

export function getExchangeInfo(order: OrderSchema | undefined, candyShop: BaseShop): ShopExchangeInfo {
  return {
    symbol: order?.symbol ?? candyShop.currencySymbol,
    decimals: order?.decimals ?? candyShop.currencyDecimals
  };
}
