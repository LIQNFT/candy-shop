import { PublicKey } from '@solana/web3.js';
import { Space, Col, Row } from 'antd';
import React, { useMemo } from 'react';
import IconTick from '../../assets/IconTick';
import { formatDate } from '../../utils/format';
import { ExplorerLink } from '../ExplorerLink';
import imgDefault from '../../assets/img-default.png';

const BuyModalConfirmed = ({
  order,
  txHash,
  walletPublicKey,
}: {
  order: any;
  txHash: string;
  walletPublicKey: PublicKey | undefined;
}) => {
  // Get wallet address follow walletPublicKey
  const walletAddress = useMemo(() => walletPublicKey?.toBase58() || '', [
    walletPublicKey,
  ]);

  return (
    <div className="buy-modal-confirmed">
      <div className="candy-title buy-modal-confirmed-header">
        <Space direction="horizontal">
          <IconTick />
          Transaction confirmed
        </Space>
      </div>
      <div className="buy-modal-confirmed-container">
        <div className="buy-modal-confirmed-thumbnail">
          <img
            src={order?.nftImageLink || imgDefault}
            width="100%"
            height="100%"
          />
        </div>
        <div className="buy-modal-confirmed-content">
          <div>
            <div>{order?.ticker}</div>
            <div className="buy-modal-price">{order?.name}</div>
          </div>
          <div>
            <div className="buy-modal-price">
              {(+order?.price / 10e9).toFixed(3)} SOL
            </div>
          </div>
        </div>
      </div>
      <hr />
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <div className="candy-label">FROM</div>
          <div className="candy-value">
            <ExplorerLink type="address" address={order.walletAddress} />
          </div>
        </Col>
        <Col span={12}>
          <div className="candy-label">TO</div>
          <div className="candy-value">
            <ExplorerLink type="address" address={walletAddress} />
          </div>
        </Col>
        <Col span={12}>
          <div className="candy-label">TRANSACTION HASH</div>
          <div className="candy-value">
            <ExplorerLink type="tx" address={txHash} />
          </div>
        </Col>
        <Col span={12}>
          <div className="candy-label">TRANSACTION CONFIRMED ON</div>
          <div className="candy-value">{formatDate(new Date())}</div>
        </Col>
      </Row>
      <button
        className="candy-button"
        onClick={() => {
          window.location.reload();
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default BuyModalConfirmed;
