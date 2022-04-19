import { CandyShop } from '@liqnft/candy-shop-sdk';
import React, { useEffect, useState } from 'react';
import './index.less';

export interface StatProps {
  candyShop: CandyShop;
  title: string | undefined;
  description: string | undefined;
  style?: { [key: string]: string | number } | undefined;
}

export const Stat = ({
  candyShop,
  title,
  description,
  style,
}: StatProps): JSX.Element => {
  const [stat, setStat] = useState<any>([]);

  const floorPrice = stat?.floorPrice
    ? (Number(stat.floorPrice) / candyShop.baseUnitsPerCurrency).toLocaleString(
        undefined,
        {
          minimumFractionDigits: candyShop.priceDecimals,
          maximumFractionDigits: candyShop.priceDecimals,
        }
      )
    : null;

  const totalListed = stat?.totalListed
    ? stat.totalListed.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : 0;

  const totalVolume = stat?.totalVolume
    ? (
        Number(stat.totalVolume) / candyShop.baseUnitsPerCurrency
      ).toLocaleString(undefined, {
        minimumFractionDigits: candyShop.volumeDecimals,
        maximumFractionDigits: candyShop.volumeDecimals,
      })
    : 0;

  // handle fetch data
  useEffect(() => {
    candyShop
      .stats()
      .then((data: any) => {
        if (!data) return;
        setStat(data);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      });
  }, [candyShop]);

  return (
    <div style={style}>
      <div className="candy-container">
        <div className="candy-stat-component-container">
          <div>
            <div className="candy-stat-component-title">{title}</div>
            <div className="candy-stat-component-description">
              {description}
            </div>
          </div>
          <div className="candy-stat-component-table">
            <div className="candy-stat-component-item">
              <div className="candy-label">FLOOR PRICE</div>
              <div className="candy-value-lg">
                {floorPrice === null
                  ? 'N/A'
                  : `${floorPrice} ${candyShop.currencySymbol}`}
              </div>
            </div>
            <div className="candy-stat-component-item">
              <div className="candy-label">TOTAL LISTED</div>
              <div className="candy-value-lg">{totalListed}</div>
            </div>
            <div className="candy-stat-component-item">
              <div className="candy-label">VOLUME</div>
              <div className="candy-value-lg">
                {totalVolume} {candyShop.currencySymbol}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
