/**
 * React component that displays a list of orders
 */
import { Card } from 'antd';
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
      const data = await fetchOrderByStoreId('123');

      setOrderList(data);
    })();
  }, [fetchOrderByStoreId]);

  return (
    <div className="order-list">
      {orderList.map((item, key) => (
        <Card
          className="order-item"
          onClick={onClick(key)}
          key={key}
          cover={
            <div className="order-thumbnail">
              <img
                src={item?.nftImageLink || 'https://via.placeholder.com/300'}
              />
            </div>
          }
        >
          <div>
            <p>ARTIST_NAME</p>
            <p>{item.ticker}</p>
          </div>
          <div>
            <p>PRICE</p>
            <p>{(+item.price / 10e9).toFixed(3)} SOL</p>
          </div>
        </Card>
      ))}
      {order && (
        <BuyModal onClose={onClose} isConnectWallet={false} order={order} />
      )}
    </div>
  );
};

export default OrderList;
