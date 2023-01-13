import { ShopExchangeInfo } from 'model';
import { notification, NotificationType } from './rc-notification';

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

export const getNumberFromPriceStr = (price: string) => {
  const arr = price.split('.');

  const replacement = arr[0].replace(/\d(?=(?:\d{3})+$)/g, '$&,');

  if (price.includes('.') && arr[1] === '') {
    return `${replacement}.`;
  }

  if (arr[1] === '0' || arr[1]) {
    return replacement + `.${arr[1]}`;
  }
  return replacement;
};

export const enum SellPriceValidationState {
  Valid = 'Valid',
  Invalid = 'Invalid',
  LessThanMinimum = 'LessThanMinimum'
}

export const validateSellPrice = (price: number, currencyDecimals: number): SellPriceValidationState => {
  const minSellPrice = Math.pow(10, 2 - currencyDecimals);
  if (isNaN(price) || price === 0) {
    notification(`Please input valid sell price`, NotificationType.Error);
    return SellPriceValidationState.Invalid;
  }
  if (price < minSellPrice) {
    notification(`The input sell price must greater than or equal to ${minSellPrice}`, NotificationType.Error);
    return SellPriceValidationState.LessThanMinimum;
  }
  return SellPriceValidationState.Valid;
};
