import React from 'react';
import { Blockchain, CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
import { CommonChain, EthWallet } from 'model';
import { AnchorWallet } from '@solana/wallet-adapter-react';

interface PriceType<C, S, W> extends CommonChain<C, S, W> {
  value: string | number | null | undefined;
  emptyValue?: string;
}
type PriceProps =
  | PriceType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | PriceType<Blockchain.Solana, CandyShop, AnchorWallet>;

const getPrice = (candyShop: CandyShop, price?: string | number | null) => {
  if (!price || isNaN(Number(price))) return null;

  return (Number(price) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

export const Price: React.FC<PriceProps> = ({ value, candyShop, emptyValue, blockchain }) => {
  const formattedValue = blockchain === Blockchain.Solana ? getPrice(candyShop, value) : 'WIP';
  emptyValue = emptyValue || 'N/A';

  return candyShop && formattedValue ? (
    <>
      {formattedValue} {candyShop.currencySymbol}
    </>
  ) : (
    <>{emptyValue}</>
  );
};
