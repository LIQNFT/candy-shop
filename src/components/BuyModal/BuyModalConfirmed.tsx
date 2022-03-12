import { Space, Col, Row } from 'antd';
import React from 'react';
import IconTick from '../../assets/IconTick';
import { formatDate } from '../../utils/format';
import { ExplorerLink } from '../ExplorerLink';

const BuyModalConfirmed = ({
  order,
  onOk,
}: {
  order: any,
  onOk: () => {}
}) => {
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
          <img src={order?.nftImageLink || 'https://via.placeholder.com/300'} width='100%' height='100%' />
        </div>
        <div className='buy-modal-confirmed-content'>
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
            {/* TODO: Hookup to seller address */}
            <ExplorerLink
              type="address"
              address="mDt3mTCWsF4xCGteZNQihqbjEdCqNcGPqg9NRJWkgxq"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="candy-label">TO</div>
          <div className="candy-value">
            {/* TODO: Hookup to buyer address */}
            <ExplorerLink
              type="address"
              address="mDt3mTCWsF4xCGteZNQihqbjEdCqNcGPqg9NRJWkgxq"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="candy-label">TRANSACTION HASH</div>
          <div className="candy-value">
            {/* TODO: Hookup to transaction hash */}
            <ExplorerLink
              type="address"
              address="mDt3mTCWsF4xCGteZNQihqbjEdCqNcGPqg9NRJWkgxq"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="candy-label">TRANSACTION CONFIRMED ON</div>
          <div className="candy-value">{formatDate(new Date())}</div>
        </Col>
      </Row>
      <button className="candy-button" onClick={onOk}>Continue Browsing</button>
    </div>
  );
};

export default BuyModalConfirmed;
