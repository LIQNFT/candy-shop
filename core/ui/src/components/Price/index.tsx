import React from 'react';

interface PriceProps {
  value: string | number | null | undefined;
  emptyValue?: string;
  currencySymbol: string;
  baseUnitsPerCurrency: number;
  priceDecimalsMin: number;
  priceDecimals: number;
}

export const Price: React.FC<PriceProps> = ({
  value,
  emptyValue,
  baseUnitsPerCurrency,
  currencySymbol,
  priceDecimals,
  priceDecimalsMin
}) => {
  const NO_PRICE = 'N/A';
  const getPrice = (price?: string | number | null) => {
    if (!price || isNaN(Number(price))) return null;

    return (Number(price) / baseUnitsPerCurrency).toLocaleString(undefined, {
      minimumFractionDigits: priceDecimalsMin,
      maximumFractionDigits: priceDecimals
    });
  };

  const formattedValue = getPrice(value);
  emptyValue = emptyValue || NO_PRICE;

  return formattedValue ? (
    <>
      {formattedValue} {currencySymbol}
    </>
  ) : (
    <>{emptyValue}</>
  );
};
