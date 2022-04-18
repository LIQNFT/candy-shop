import React, { useMemo, useState } from 'react';

import { CandyShop } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { BuyModal } from 'components/BuyModal';
import { LiqImage } from 'components/LiqImage';
import { CancelModal } from 'components/CancelModal';

import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

import './index.less';

export interface OrderProps {
  order: OrderSchema;
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  url?: string;
}

export const Order: React.FC<OrderProps> = ({
  order,
  wallet,
  candyShop,
  walletConnectComponent,
  url
}) => {
  const [selection, setSelection] = useState<OrderSchema>();

  const orderPrice = useMemo(() => {
    try {
      return (
        Number(order?.price) / candyShop.baseUnitsPerCurrency
      ).toLocaleString(undefined, {
        minimumFractionDigits: candyShop.priceDecimals,
        maximumFractionDigits: candyShop.priceDecimals
      });
    } catch (err) {
      return null;
    }
  }, [candyShop.baseUnitsPerCurrency, candyShop.priceDecimals, order?.price]);

  const onClose = () => setSelection(undefined);

  const onClick = () => {
    if (url) {
      window.location.href = url.replace(':tokenMint', order.tokenMint);
    } else {
      setSelection(order);
    }
  };

  const isUserListing =
    wallet?.publicKey && order.walletAddress === wallet.publicKey.toString();

  return (
    <>
      <div className="candy-order candy-card-border" onClick={onClick}>
        {isUserListing && <div className="candy-status-tag">Your Listing</div>}
        <LiqImage
          alt={order?.name}
          src={order?.nftImageLink}
          fit="cover"
          style={{ borderTopRightRadius: 14, borderTopLeftRadius: 14 }}
        />
        <div className="candy-order-info">
          <div className="candy-order-name-container">
            <div className="name">{order?.name}</div>
            <div className="ticker candy-line-limit-1">{order?.ticker}</div>
          </div>
          <div className="candy-order-price-container">
            <div className="text">Price</div>
            <div className="price candy-line-limit-1">
              {orderPrice ? `${orderPrice} ${candyShop.currencySymbol}` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {selection && !isUserListing && (
        <BuyModal
          order={selection}
          onClose={onClose}
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={walletConnectComponent}
        />
      )}

      {selection && isUserListing && wallet ? (
        <CancelModal
          onClose={onClose}
          candyShop={candyShop}
          order={selection}
          wallet={wallet}
        />
      ) : null}
    </>
  );
};
