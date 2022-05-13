import { CandyShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from 'model';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

export function getExchangeInfo(order: OrderSchema, candyShop: CandyShop): ShopExchangeInfo {
  return {
    symbol: order.symbol ?? candyShop.currencySymbol,
    decimals: order.decimals ?? candyShop.currencyDecimals
  };
}
