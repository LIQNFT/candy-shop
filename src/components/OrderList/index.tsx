/**
 * React component that displays a list of orders
 */
import { Card, Col, Row } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { fetchOrderByStoreId } from '../../api/backend/OrderAPI';
import BuyModal from '../BuyModal';
import './style.less';

const OrderList = () => {
  const [orderList, setOrderList] = useState<any[]>([]);
  const [order, setOrder] = useState();

  const onClick = useCallback(
    (idx: number) => () => {
      setOrder(orderList[idx]);
    },
    [orderList]
  );

  const onClose = useCallback(() => {
    setOrder(undefined);
  }, []);

  useEffect(() => {
    (async () => {
      // Fetch order list
      fetchOrderByStoreId('BZHgtcQ47QJg7WnAF73sxRtH5vQT2DFUMTowEhqiL4ks')
        .then((data: any) => {
          setOrderList(data.result);
          setOrder(data.result[0]);
        })
        .catch(err => {
          throw err;
        });
    })();
  }, [fetchOrderByStoreId]);

  return (
    <div className="order-list">
      <Row gutter={50}>
        {orderList.map((item, key) => (
          <Col key={key} md={8}>
            <Card
              className="order-item"
              onClick={onClick(key)}
              cover={
                <div className="order-thumbnail">
                  <img
                    src={
                      item?.nftImageLink || 'https://via.placeholder.com/300'
                    }
                  />
                </div>
              }
            >
              <div>
                <p className='label'>ARTIST_NAME</p>
                <p>{item.name}</p>
              </div>
              <div>
                <p className='label'>PRICE</p>
                <p>{(+item.price / 10e9).toFixed(3)} SOL</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      {order && (
        <BuyModal onClose={onClose} isConnectWallet={false} order={order} />
      )}
    </div>
  );
};

export default OrderList;
