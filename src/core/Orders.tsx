import styled from '@emotion/styled';
import { PublicKey } from '@solana/web3.js';
import { fetchOrdersByStoreId } from 'api/backend/OrderAPI';
import { Empty } from 'components/Empty';
import { Order } from 'components/Order';
import { Skeleton } from 'components/Skeleton';
import { breakPoints } from 'constant/breakPoints';
import React, { useEffect, useState } from 'react';
import { CandyShop } from './CandyShop';

interface OrdersProps {
  walletPublicKey?: PublicKey;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
}

/**
 * React component that displays a list of orders
 */
export const Orders: React.FC<OrdersProps> = ({
  walletPublicKey,
  candyShop,
  walletConnectComponent,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // handle fetch data
  useEffect(() => {
    setLoading(true);
    fetchOrdersByStoreId(candyShop.candyShopAddress().toString())
      .then((data: any) => {
        if (!data.result) return;
        setOrders(data.result);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [candyShop]);

  return (
    <>
      <Wrap>
        <div className="cds-container">
          {loading ? (
            <Flex>
              {Array(3)
                .fill(0)
                .map((_, key) => (
                  <FlexItem key={key}>
                    <Skeleton />
                  </FlexItem>
                ))}
            </Flex>
          ) : !orders.length ? (
            <Empty description="No orders found" />
          ) : (
            <Flex>
              {orders.map((item, key) => (
                <FlexItem key={key}>
                  <Order
                    order={item}
                    walletPublicKey={walletPublicKey}
                    candyShop={candyShop}
                    walletConnectComponent={walletConnectComponent}
                  />
                </FlexItem>
              ))}
            </Flex>
          )}
        </div>
      </Wrap>
    </>
  );
};

const Wrap = styled.div`
  font-family: 'Work Sans', sans-serif;
`;

const Flex = styled.div`
  display: flex;
  flex-flow: row wrap;
  row-gap: 24px;
  column-gap: 24px;
  > * {
    width: calc((100% - 24px * 2) / 3);
  }

  @media ${breakPoints.tabletM} {
    row-gap: 16px;
    column-gap: 16px;
    > * {
      width: 100%;
    }
  }
`;

const FlexItem = styled.div``;
