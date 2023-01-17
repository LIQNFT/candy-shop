import React, { useEffect, useState } from 'react';
import { BaseShop, fetchStatsByShopAddress } from '@liqnft/candy-shop-sdk';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { StatActionsStatus } from 'constant';
import { useUpdateCandyShopContext } from 'public/Context/CandyShopDataValidator';
import { ShopProps } from '../../model';
import './index.less';
import { ShopStats } from '@liqnft/candy-shop-types';

interface StatProps extends ShopProps {
  title: string | undefined;
  description: string | undefined;
  style?: { [key: string]: string | number } | undefined;
}

const getFloorPrice = (candyShop: BaseShop, stat: any) => {
  if (!stat?.floorPrice) return null;

  return (Number(stat.floorPrice) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

const getTotalVolume = (candyShop: BaseShop, stat: any) => {
  if (!stat?.totalVolume) return 0;
  return (Number(stat.totalVolume) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.volumeDecimalsMin,
    maximumFractionDigits: candyShop.volumeDecimals
  });
};

const Logger = 'CandyShopUI/Stat: ';
export const Stat: React.FC<StatProps> = ({ title, description, style, candyShop }): JSX.Element => {
  const [stat, setStat] = useState<ShopStats>();

  const candyShopAddress = candyShop.candyShopAddress;
  const statUpdateStatus = useValidateStatus(StatActionsStatus);
  useUpdateCandyShopContext({ candyShopAddress, network: candyShop.env as any });

  useEffect(() => {
    if (!candyShopAddress) return;

    fetchStatsByShopAddress(candyShopAddress)
      .then((data: ShopStats) => {
        if (!data) return;
        setStat(data);
      })
      .catch((err: Error) => {
        console.log(`${Logger} fetchStatsByShopAddress failed, error=`, err);
      });
    // statUpdateStatus on polling
  }, [candyShopAddress, statUpdateStatus]);

  const floorPrice = getFloorPrice(candyShop, stat);
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
              <div className="candy-value-lg">{stat?.totalListed || '0'}</div>
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
