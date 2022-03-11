/**
 * React component that displays a list of orders
 */
import { Col, Empty, Row, Skeleton } from 'antd';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { fetchOrderByStoreId } from '../../api/backend/OrderAPI';
import Order from '../Order';

const OrderList = () => {
  const [orderList, setOrderList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch order list
    fetchOrderByStoreId('5wbadqR2UBmV8AUBKxAE64z5ASBorsUofoHQWhJSVYpZ')
      .then((data: any) => {
        if (!data.result) return;

        setOrderList(data.result);
      })
      .catch(err => {
        console.info('fetchOrderByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchOrderByStoreId]);

  return (
    <div className="order-list">
      <Row gutter={50}>
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, key) => (
              <Col key={key} md={8}>
                <Skeleton />
              </Col>
            ))
        ) : !orderList.length ? (
          <Col span={24}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Col>
        ) : (
          orderList.map((item, key) => (
            <Col key={key} md={8}>
              <Order order={item} />
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default OrderList;
