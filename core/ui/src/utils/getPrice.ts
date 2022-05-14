import { CandyShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from 'model';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';

export const getPrice: any = (candyShop: CandyShop, order: OrderSchema, exchangeInfo: ShopExchangeInfo) => {
  if (!order?.price || !exchangeInfo) return null;

  return (Number(order?.price) / Math.pow(10, exchangeInfo.decimals)).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};
