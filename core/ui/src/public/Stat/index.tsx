import React, { useEffect, useState } from 'react';

import { CandyShop } from '@liqnft/candy-shop-sdk';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { StatActionsStatus } from 'constant';

import './index.less';
import { useUpdateSubject } from 'public/Context/CandyShopDataValidator';
import { ShopStatusType } from '@liqnft/candy-shop-types';

export interface StatProps {
  title: string | undefined;
  description: string | undefined;
  style?: { [key: string]: string | number } | undefined;
  candyShop: CandyShop;
}

const getFloorPrice = (candyShop: CandyShop, stat: any) => {
  if (!stat?.floorPrice) return null;

  return (Number(stat.floorPrice) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

const getTotalListed = (stat: any) => {
  if (!stat?.totalListed) return 0;

  return stat.totalListed.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const getTotalVolume = (candyShop: CandyShop, stat: any) => {
  if (!stat?.totalVolume) return 0;
  return (Number(stat.totalVolume) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.volumeDecimalsMin,
    maximumFractionDigits: candyShop.volumeDecimals
  });
};

export const Stat: React.FC<StatProps> = ({ title, description, style, candyShop }): JSX.Element => {
  const [stat, setStat] = useState<any>();

  const statUpdateStatus = useValidateStatus(StatActionsStatus);
  useUpdateSubject({ subject: ShopStatusType.Order, candyShopAddress: candyShop.candyShopAddress });

  // handle fetch data
  useEffect(() => {
    candyShop
      .stats()
      .then((data: any) => {
        if (!data) return;
        setStat(data);
      })
      .catch((err: any) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      });
    // statUpdateStatus on polling
  }, [candyShop, statUpdateStatus]);

  const floorPrice = getFloorPrice(candyShop, stat);
  const totalListed = getTotalListed(stat);
  const totalVolume = getTotalVolume(candyShop, stat);

  return (
    <div style={style}>
      <div className="candy-container">
        <div className="candy-stat-component-container">
          <div>
            <div className="candy-stat-component-title">{title}</div>
            <div className="candy-stat-component-description">{description}</div>
          </div>
          <div className="candy-stat-component-table">
            <div className="candy-stat-component-item">
              <div className="candy-label">FLOOR PRICE</div>
              <div className="candy-value-lg">
                {floorPrice === null ? 'N/A' : `${floorPrice} ${candyShop.currencySymbol}`}
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
