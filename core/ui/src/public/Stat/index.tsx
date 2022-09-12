import React, { useEffect, useState } from 'react';

import { Blockchain, CandyShop, EthCandyShop, fetchStatsByShopAddress } from '@liqnft/candy-shop-sdk';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { StatActionsStatus } from 'constant';

import './index.less';
import { useUpdateSubject } from 'public/Context/CandyShopDataValidator';
import { ShopStatusType } from '@liqnft/candy-shop-types';
import { CommonChain, EthWallet } from '../../model';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export interface StatType<C, S, W> extends CommonChain<C, S, W> {
  title: string | undefined;
  description: string | undefined;
  style?: { [key: string]: string | number } | undefined;
}
type StatProps =
  | StatType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | StatType<Blockchain.Solana, CandyShop, AnchorWallet>;

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

const Logger = 'CandyShopUI/Stat: ';
export const Stat: React.FC<StatProps> = ({ title, description, style, ...chainProps }): JSX.Element => {
  const [stat, setStat] = useState<any>();

  const candyShopAddress = chainProps.candyShop.candyShopAddress;

  const statUpdateStatus = useValidateStatus(StatActionsStatus);
  useUpdateSubject({ subject: ShopStatusType.Order, candyShopAddress });

  useEffect(() => {
    fetchStatsByShopAddress(candyShopAddress)
      .then((data: any) => {
        if (!data) return;
        // TODO: handle data from ETH
        console.log({ data });
        setStat(data);
      })
      .catch((err: Error) => {
        console.log(`${Logger} fetchOrdersByStoreId failed, error=`, err);
      });
    // statUpdateStatus on polling
  }, [candyShopAddress, statUpdateStatus]);

  const floorPrice = chainProps.blockchain === Blockchain.Solana ? getFloorPrice(chainProps.candyShop, stat) : 0;
  const totalListed = chainProps.blockchain === Blockchain.Solana ? getTotalListed(stat) : 0;
  const totalVolume = chainProps.blockchain === Blockchain.Solana ? getTotalVolume(chainProps.candyShop, stat) : 0;

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
                {floorPrice === null ? 'N/A' : `${floorPrice} ${chainProps.candyShop.currencySymbol}`}
              </div>
            </div>
            <div className="candy-stat-component-item">
              <div className="candy-label">TOTAL LISTED</div>
              <div className="candy-value-lg">{totalListed}</div>
            </div>
            <div className="candy-stat-component-item">
              <div className="candy-label">VOLUME</div>
              <div className="candy-value-lg">
                {totalVolume} {chainProps.candyShop.currencySymbol}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
