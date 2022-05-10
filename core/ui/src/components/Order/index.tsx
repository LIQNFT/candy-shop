import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';

import { BuyModal } from 'components/BuyModal';
import { LiqImage } from 'components/LiqImage';
import { CancelModal } from 'components/CancelModal';

import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CandyShop } from '@liqnft/candy-shop-sdk';

import './index.less';

export interface OrderProps {
  order: OrderSchema;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  url?: string;
  candyShop: CandyShop;
}
const getPrice = (candyShop: CandyShop, order: OrderSchema) => {
  if (!order?.price) return null;

  return (Number(order?.price) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

export const Order: React.FC<OrderProps> = ({ order, wallet, walletConnectComponent, url, candyShop }) => {
  const [selection, setSelection] = useState<OrderSchema>();
  const [orderCandyShop, setOrderCandyShop] = useState<CandyShop>(candyShop);

  const onClose = () => {
    setSelection(undefined);
  };

  const onClick = () => {
    if (url) {
      window.location.href = url.replace(':tokenMint', order.tokenMint);
    } else {
      setOrderCandyShop(
        new CandyShop(
          new web3.PublicKey(order.candyShopCreatorAddress),
          new web3.PublicKey(order.treasuryMint),
          candyShop.programId,
          candyShop.env,
          candyShop.settings
        )
      );

      setSelection(order);
    }
  };

  const isUserListing = wallet?.publicKey && order.walletAddress === wallet.publicKey.toString();
  const orderPrice = getPrice(candyShop, order);

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
          <div className="candy-order-name candy-line-limit-1">
            {`${order?.name}${order?.edition !== 0 ? ` #${order?.edition}` : ''}`}
          </div>
          <div className="candy-order-ticker candy-line-limit-1">{order?.ticker}</div>
          <div className="candy-order-price candy-line-limit-1">
            {orderPrice ? `${orderPrice} ${candyShop.currencySymbol}` : 'N/A'}
          </div>
        </div>
      </div>

      {selection && !isUserListing ? (
        <BuyModal
          order={selection}
          onClose={onClose}
          wallet={wallet}
          candyShop={orderCandyShop}
          walletConnectComponent={walletConnectComponent}
        />
      ) : null}

      {selection && isUserListing && wallet ? (
        <CancelModal onClose={onClose} candyShop={orderCandyShop} order={selection} wallet={wallet} />
      ) : null}
    </>
  );
};
