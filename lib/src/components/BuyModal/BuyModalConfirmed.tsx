import React, { useMemo } from 'react';

import { CandyShop } from '@liqnft/candy-shop-sdk';
import { web3 } from '@project-serum/anchor';
import { formatDate } from '../../utils/format';

import { ExplorerLink } from '../ExplorerLink';
import { LiqImage } from 'components/LiqImage';
import IconTick from 'assets/IconTick';

const BuyModalConfirmed = ({
  order,
  txHash,
  walletPublicKey,
  candyShop,
}: {
  order: any;
  txHash: string;
  walletPublicKey: web3.PublicKey | undefined;
  candyShop: CandyShop;
}) => {
  // Get wallet address follow walletPublicKey
  const walletAddress = useMemo(
    () => walletPublicKey?.toBase58() || '',
    [walletPublicKey]
  );

  const orderPrice = useMemo(() => {
    try {
      return (
        Number(order?.price) / candyShop.baseUnitsPerCurrency
      ).toLocaleString(undefined, {
        minimumFractionDigits: candyShop.priceDecimals,
        maximumFractionDigits: candyShop.priceDecimals,
      });
    } catch (err) {
      return null;
    }
  }, [order]);

  return (
    <div className="candy-buy-modal-confirmed">
      <div className="candy-buy-modal-confirmed-header">
        <IconTick />
        <div>Transaction Confirmed</div>
      </div>
      <div className="candy-buy-modal-confirmed-container">
        <div className="candy-buy-modal-confirmed-thumbnail">
          <LiqImage src={order?.nftImageLink} alt={order?.name} fit="contain" />
        </div>
        <div className="candy-buy-modal-confirmed-content">
          <div>
            <div className="candy-buy-modal-name">{order?.name}</div>
            <div className="candy-buy-modal-ticker">{order?.ticker}</div>
          </div>
          <div>
            <div className="candy-buy-modal-price">
              {orderPrice ? `${orderPrice} ${candyShop.currencySymbol}` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="candy-buy-modal-confirmed-flex">
        <div className="candy-buy-modal-confirmed-item">
          <div className="candy-label">FROM</div>
          <div className="candy-value">
            <ExplorerLink type="address" address={order.walletAddress} />
          </div>
        </div>
        <div className="candy-buy-modal-confirmed-item">
          <div className="candy-label">TO</div>
          <div className="candy-value">
            <ExplorerLink type="address" address={walletAddress} />
          </div>
        </div>
        <div className="candy-buy-modal-confirmed-item">
          <div className="candy-label">TRANSACTION HASH</div>
          <div className="candy-value">
            <ExplorerLink type="tx" address={txHash} />
          </div>
        </div>
        <div className="candy-buy-modal-confirmed-item">
          <div className="candy-label">CONFIRMED ON</div>
          <div className="candy-value">{formatDate(new Date())}</div>
        </div>
      </div>
      <button
        className="candy-button"
        onClick={() => {
          window.location.reload();
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default BuyModalConfirmed;
