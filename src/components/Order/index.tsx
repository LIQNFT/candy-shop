import React, { useCallback, useState } from 'react';
import { Card, Statistic } from 'antd';
import { BuyModal } from '../BuyModal';
import { LiqImage } from '../LiqImage';

export const Order = ({ order }: { order: any }) => {
  const [selection, setSelection] = useState(null);

  const onClose = useCallback(() => {
    setSelection(null);
  }, []);

  const onClick = useCallback(() => {
    setSelection(order);
  }, [order]);

  return (
    <>
      <Card className="vault-list-item" onClick={onClick}>
        <LiqImage alt={order?.name} src={order?.nftImageLink} />
        <div className="vault-list-item-body">
          <div className="vault-list-item-header">
            <div
              className="vault-name"
              style={{ verticalAlign: 'middle', fontWeight: 'bold', marginBottom: '2px', width: '60%' }}
            >
              {order?.name}
              <div className="subtitle">{order?.ticker}</div>
            </div>
            <div className="mint-price">
              <span className="vault-statistic-title-caps">Price</span>
              <Statistic suffix="SOL" value={order?.price} precision={2} valueStyle={{ fontSize: 16, fontWeight: 'bold' }} />
            </div>
          </div>
        </div>
      </Card>
      {selection && (
        <BuyModal onClose={onClose} isConnectWallet={false} order={selection} />
      )}
    </>
  );
};

