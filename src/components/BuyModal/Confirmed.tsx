import { Col, Row } from 'antd';
import React from 'react';
import { formatDate, formatID } from '../../helps/format';

const Confirmed = ({ order }: { order: any }) => {
  return (
    <div className="buy-modal-confirmed">
      <div className="buy-modal-confirmed-header">
        <span>Transaction confirmed</span>
      </div>
      <div className="buy-modal-confirmed-container">
        <div className="buy-modal-confirmed-thumbnail">
          <img src={order?.nftImageLink || 'https://via.placeholder.com/300'} />
        </div>
        <div>
          <div>
            <p>artist_name</p>
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
          <p className="label">FROM</p>
          <div className="color-purple">{formatID(order?.walletAddress)}</div>
        </Col>
        <Col span={12}>
          <p className="label">TO</p>
          <div className="color-purple">0x562F...ebFe</div>
        </Col>
        <Col span={12}>
          <p className="label">TRANSACTION HASH</p>
          <div className="color-purple">0x562F...ebFe</div>
        </Col>
        <Col span={12}>
          <p className="label">TRANSACTION CONFIRMED ON</p>
          <div>{formatDate(new Date())}</div>
        </Col>
      </Row>
      <button className="candy-button">Checkout</button>
    </div>
  );
};

export default Confirmed;
