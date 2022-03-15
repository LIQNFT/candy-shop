import React from 'react';
import { Col, Empty, Row, Skeleton } from 'antd';
import { Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { fetchOrdersByStoreId } from '../api/backend/OrderAPI';
import { Order } from '../components/Order';
import { CandyShop } from './CandyShop';

interface OrdersProps {
  connection: Connection;
  walletPublicKey: PublicKey;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
}

/**
 * React component that displays a list of orders
 */
export const Orders: React.FC<OrdersProps> = ({
  walletPublicKey,
  connection,
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
      .catch(err => {
        console.info('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchOrdersByStoreId]);

  return (
    <div className="candy-shop-list">
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
    </div>
  );
};
