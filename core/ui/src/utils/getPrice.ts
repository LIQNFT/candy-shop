import { ShopExchangeInfo } from 'model';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';

export const getPrice = (
  shopPriceDecimalsMin: number,
  shopPriceDecimals: number,
  order?: OrderSchema,
  exchangeInfo?: ShopExchangeInfo
): any => {
  if (!order?.price || !exchangeInfo) return null;

  return (Number(order?.price) / Math.pow(10, exchangeInfo.decimals)).toLocaleString(undefined, {
    minimumFractionDigits: shopPriceDecimalsMin,
    maximumFractionDigits: shopPriceDecimals
  });
};
