import { CandyShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from 'model';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

export const getPrice: any = (candyShop: CandyShop, order: OrderSchema, shopExchangeInfo: ShopExchangeInfo) => {
  if (!order?.price) return null;
  const decimals = shopExchangeInfo.decimals;

  return (Number(order?.price) / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};
