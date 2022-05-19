import React from 'react';

import { web3 } from '@project-serum/anchor';
import { formatDate } from 'utils/format';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { ExplorerLink } from 'components/ExplorerLink';
import { LiqImage } from 'components/LiqImage';
import IconTick from 'assets/IconTick';

import { CandyShop } from '@liqnft/candy-shop-sdk';

interface BuyModalConfirmedProps {
  order: OrderSchema;
  txHash: string;
  walletPublicKey: web3.PublicKey | undefined;
  onClose: () => void;
  candyShop: CandyShop;
}

const getPrice = (candyShop: CandyShop, order: OrderSchema) => {
  if (!order?.price) return null;

  return (Number(order?.price) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

const BuyModalConfirmed: React.FC<BuyModalConfirmedProps> = ({
  order,
  txHash,
  walletPublicKey,
  onClose,
  candyShop
}) => {
  const walletAddress = walletPublicKey?.toBase58();

  const orderPrice = getPrice(candyShop, order);

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
          <div className="candy-value">{walletAddress && <ExplorerLink type="address" address={walletAddress} />}</div>
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
      <button className="candy-button" onClick={onClose}>
        Continue Shopping
      </button>
    </div>
  );
};

export default BuyModalConfirmed;