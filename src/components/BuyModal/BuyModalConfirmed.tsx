import { Col, Row } from 'antd';
import React from 'react';
import IconTick from '../../assets/IconTick';
import { formatDate, formatID } from '../../utils/format';

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
        <IconTick />
        <div>Transaction confirmed</div>
      </div>
      <div className="buy-modal-confirmed-container">
        <div className="buy-modal-confirmed-thumbnail">
          <img src={order?.nftImageLink || 'https://via.placeholder.com/300'} width='100%' height='100%' />
        </div>
        <div className='buy-modal-confirmed-content'>
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
          <p className="candy-label">FROM</p>
          <div className="color-purple">{formatID(order?.walletAddress)}</div>
        </Col>
        <Col span={12}>
          <p className="candy-label">TO</p>
          <div className="color-purple">0x562F...ebFe</div>
        </Col>
        <Col span={12}>
          <p className="candy-label">TRANSACTION HASH</p>
          <div className="color-purple">0x562F...ebFe</div>
        </Col>
        <Col span={12}>
          <p className="candy-label">TRANSACTION CONFIRMED ON</p>
          <div>{formatDate(new Date())}</div>
        </Col>
      </Row>
      <button className="candy-button" onClick={onOk}>Continue Browsing</button>
    </div>
  );
};

export default BuyModalConfirmed;
