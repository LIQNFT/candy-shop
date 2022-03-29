import styled from '@emotion/styled';
import { Card, Statistic } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { BuyModal } from '../BuyModal';
import { LiqImage } from '../LiqImage';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CandyShop } from 'core/CandyShop';

export interface OrderProps {
  order: OrderSchema;
  walletPublicKey: PublicKey | undefined;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
}

export const Order: React.FC<OrderProps> = ({
  order,
  walletPublicKey,
  candyShop,
  walletConnectComponent,
}) => {
  const [selection, setSelection] = useState<OrderSchema | null>(null);

  const orderPrice = useMemo(() => {
    if (!order) return 0;
    return (Number(order?.price) / LAMPORTS_PER_SOL).toFixed(2);
  }, [order]);

  const onClose = useCallback(() => {
    setSelection(null);
  }, []);

  const onClick = useCallback(() => {
    setSelection(order);
  }, [order]);

  return (
    <>
      {/* <Card className="vault-list-item" onClick={onClick}>
        <LiqImage alt={order?.name} src={order?.nftImageLink!} />
        <div className="vault-list-item-body">
          <div className="vault-list-item-header">
            <div
              className="vault-name"
              style={{
                verticalAlign: 'middle',
                fontWeight: 'bold',
                marginBottom: '2px',
                width: '60%',
              }}
            >
              {order?.name}
              <div className="subtitle">{order?.ticker}</div>
            </div>
            <div className="mint-price">
              <span className="vault-statistic-title-caps">Price</span>
              <Statistic
                suffix="SOL"
                value={(order?.price as any) / LAMPORTS_PER_SOL}
                precision={2}
                valueStyle={{ fontSize: 14, fontWeight: 'bold' }}
              />
            </div>
          </div>
        </div>
      </Card> */}

      <Wrap onClick={onClick}>
        <LiqImage alt={order?.name} src={order?.nftImageLink!} />
        <OrderInfo>
          <Name>
            <div className="name">{order?.name}</div>
            <div className="ticker cds-line-limit-1">{order?.ticker}</div>
          </Name>
          <Price>
            <div className="text">Price</div>
            <div className="price cds-line-limit-1">{orderPrice} SOL</div>
          </Price>
        </OrderInfo>
      </Wrap>

      {selection && (
        <BuyModal
          order={selection}
          onClose={onClose}
          walletPublicKey={walletPublicKey}
          candyShop={candyShop}
          walletConnectComponent={walletConnectComponent}
        />
      )}
    </>
  );
};

const Wrap = styled.div`
  height: 100%;
  border-radius: 16px;
  border: 2px solid black;
  background-color: white;
`;

const OrderInfo = styled.div`
  padding: 15px;
  display: flex;
  > *:nth-child(1) {
    width: 60%;
  }
  > *:nth-child(2) {
    width: 40%;
  }
`;

const Name = styled.div`
  font-weight: bold;
  .name {
    font-size: 20px;
  }
  .ticker {
    font-size: 14px;
  }
`;

const Price = styled.div`
  align-self: flex-end;
  text-align: right;
  .text {
    color: #757575;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .price {
    font-size: 14px;
    font-weight: bold;
  }
`;
