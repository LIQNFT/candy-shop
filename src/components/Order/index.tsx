import { Card } from 'antd';
import React, { useCallback, useState } from 'react';
import BuyModal from '../BuyModal';

const Order = ({ order }: { order: any }) => {
  const [selection, setSelection] = useState(null);

  const onClose = useCallback(() => {
    setSelection(null);
  }, []);

  const onClick = useCallback(() => {
    setSelection(order);
  }, [order]);

  return (
    <>
      <Card
        className="candy-item"
        onClick={onClick}
        cover={
          <div className="candy-item-thumbnail">
            <img
              src={order?.nftImageLink || 'https://via.placeholder.com/300'}
            />
          </div>
        }
      >
        <div>
          <p className="candy-label">ARTIST_NAME</p>
          <p>{order?.name}</p>
        </div>
        <div>
          <p className="candy-label">PRICE</p>
          <p>{order?.price ? (order.price / 10e9).toFixed(3) : 0} SOL</p>
        </div>
      </Card>
      {selection && (
        <BuyModal onClose={onClose} isConnectWallet={false} order={selection} />
      )}
    </>
  );
};

export default Order;
