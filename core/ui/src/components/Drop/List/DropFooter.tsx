import React from 'react';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Drop } from '@liqnft/candy-shop-types';

import { getPrice } from 'utils/getPrice';
import { Price } from 'components/Price';
import { VaultCountdown } from './VaultCountdown';
import { ConfigPrice } from 'model';

const EXCHANGE_INFO = { decimals: 0 };

interface DropFooterProps extends ConfigPrice {
  candyShop: CandyShop;
  nft: Drop;
}

export const DropFooter: React.FC<DropFooterProps> = ({
  candyShop,
  nft,
  baseUnitsPerCurrency,
  currencySymbol,
  priceDecimals,
  priceDecimalsMin
}) => {
  return (
    <div className="candy-edition-list-footer-card">
      <div className="row">
        <div className="candy-edition-name-price">
          <div className="name">{nft.nftName}</div>
          <span className="candy-price">
            <Price
              currencySymbol={currencySymbol}
              baseUnitsPerCurrency={baseUnitsPerCurrency}
              priceDecimalsMin={priceDecimalsMin}
              priceDecimals={priceDecimals}
              value={nft.price}
            />
          </span>
        </div>
      </div>
      <div className="candy-edition-slide">
        <div className="background-slide" />
        <div className="slide" style={{ width: `${(1 - nft.currentSupply / nft.maxSupply) * 100}%` }} />
      </div>
      <div className="available">
        Available:{' '}
        <span>
          {getPrice(
            candyShop.priceDecimalsMin,
            candyShop.priceDecimals,
            nft.maxSupply - nft.currentSupply,
            EXCHANGE_INFO
          ) || 0}
          /{getPrice(candyShop.priceDecimalsMin, candyShop.priceDecimals, nft.maxSupply, EXCHANGE_INFO)}
        </span>
      </div>

      <VaultCountdown
        launchTime={Number(nft.startTime)}
        whitelistTime={nft.whitelistTime ? Number(nft.whitelistTime) : undefined}
      />
    </div>
  );
};
