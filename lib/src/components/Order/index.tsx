import React, { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { CandyShop } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { BuyModal } from 'components/BuyModal';
import { LiqImage } from 'components/LiqImage';
import { CancelModal } from 'components/CancelModal';

import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

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
  url,
}) => {
  const [selection, setSelection] = useState<OrderSchema>();

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
  }, [candyShop.baseUnitsPerCurrency, candyShop.priceDecimals, order?.price]);

  const onClose = () => setSelection(undefined);

  const onClick = () => {
    if (url) {
      window.location.href = url.replace(':tokenMint', order.tokenMint);
    } else {
      setSelection(order);
    }
  };

  const isListed =
    wallet?.publicKey && order.walletAddress === wallet.publicKey.toString();

  return (
    <>
      <Wrap onClick={onClick}>
        {isListed ? (
          <div className="vault-status-tag">Listed for Sale</div>
        ) : null}
        <LiqImage
          alt={order?.name}
          src={order?.nftImageLink}
          fit="cover"
          style={{ borderTopRightRadius: 14, borderTopLeftRadius: 14 }}
        />
        <OrderInfo>
          <Name>
            <div className="name">{order?.name}</div>
            <div className="ticker candy-line-limit-1">{order?.ticker}</div>
          </Name>
          <Price>
            <div className="text">Price</div>
            <div className="price candy-line-limit-1">
              {orderPrice ? `${orderPrice} ${candyShop.currencySymbol}` : 'N/A'}
            </div>
          </Price>
        </OrderInfo>
      </Wrap>

      {selection && !isListed && (
        <BuyModal
          order={selection}
          onClose={onClose}
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={walletConnectComponent}
        />
      )}

      {selection && isListed && wallet ? (
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

const Wrap = styled.div`
  height: 100%;
  border-radius: 16px;
  border: 2px solid black;
  background-color: white;
  position: relative;
`;

const OrderInfo = styled.div`
  padding: 15px;
  display: flex;
  > *:nth-of-type(1) {
    width: 60%;
  }
  > *:nth-of-type(2) {
    width: 40%;
  }
`;

const Name = styled.div`
  .name {
    font-weight: bold;
    font-size: 16px;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .ticker {
    font-size: 14px;
    text-align: left;
  }
`;

const Price = styled.div`
  align-self: flex-end;
  text-align: right;
  .text {
    color: #757575;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: bold;
  }
  .price {
    font-size: 14px;
    font-weight: bold;
  }
`;
