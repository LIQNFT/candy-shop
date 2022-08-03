import { ShopExchangeInfo } from 'model';

export const getPrice = (
  shopPriceDecimalsMin: number,
  shopPriceDecimals: number,
  price: string | number | undefined,
  exchangeInfo?: ShopExchangeInfo
): string | null => {
  if (!price || !exchangeInfo) return null;

  return (Number(price) / Math.pow(10, exchangeInfo.decimals)).toLocaleString(undefined, {
    minimumFractionDigits: shopPriceDecimalsMin,
    maximumFractionDigits: shopPriceDecimals
  });
};
