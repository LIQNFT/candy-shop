import React, { useState, useEffect } from 'react';
import { CandyShop } from '@liqnft/candy-shop-sdk';

interface PriceProps {
  value: string | number | null | undefined;
  candyShop: CandyShop;
  emptyValue?: string;
}

const getPrice = (candyShop: CandyShop, price?: string | number | null) => {
  if (!price || isNaN(Number(price))) return null;

  return (Number(price) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

export const Price: React.FC<PriceProps> = ({ value, candyShop, emptyValue }) => {
  let formattedValue = getPrice(candyShop, value);
  emptyValue = emptyValue || 'N/A';

  return candyShop && formattedValue ? (
    <>
      {formattedValue} {candyShop.currencySymbol}
    </>
  ) : (
    <>{emptyValue}</>
  );
};
