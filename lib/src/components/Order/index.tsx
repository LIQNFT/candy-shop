import styled from '@emotion/styled';
import { web3 } from '@project-serum/anchor';
import { BuyModal } from 'components/BuyModal';
import { LiqImage } from 'components/LiqImage';
import { CandyShop } from 'core/CandyShop';
import React, { useCallback, useMemo, useState } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

export interface OrderProps {
  order: OrderSchema;
  walletPublicKey?: web3.PublicKey;
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
    return (Number(order?.price) / web3.LAMPORTS_PER_SOL).toFixed(2);
  }, [order]);

  const onClose = useCallback(() => {
    setSelection(null);
  }, []);

  const onClick = useCallback(() => {
    setSelection(order);
  }, [order]);

  return (
    <>
      <Wrap onClick={onClick}>
        <LiqImage alt={order?.name} src={order?.nftImageLink} />
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
