import styled from '@emotion/styled';
import { PublicKey } from '@solana/web3.js';
import { Col, Empty, Row, Skeleton } from 'antd';
import { fetchOrdersByStoreId } from 'api/backend/OrderAPI';
import { Order } from 'components/Order';
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

  console.log(orders);

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
      {/* <div className="candy-shop-list">
        <Row
          gutter={[
            { md: 24, xs: 16 },
            { md: 24, xs: 16 },
          ]}
        >
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, key) => (
                <Col key={key} md={8} xs={24}>
                  <Skeleton />
                </Col>
              ))
          ) : !orders.length ? (
            <Col span={24}>
              <Empty description="No orders found" />
            </Col>
          ) : (
            orders.map((item, key) => {
              return (
                <Col key={key} md={8} xs={24}>
                  <Order
                    order={item}
                    walletPublicKey={walletPublicKey}
                    candyShop={candyShop}
                    walletConnectComponent={walletConnectComponent}
                  />
                </Col>
              );
            })
          )}
        </Row>
      </div> */}

      <Wrap>
        <div className="cds-container">
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
        </div>
      </Wrap>
    </>
  );
};

const Wrap = styled.div``;

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
