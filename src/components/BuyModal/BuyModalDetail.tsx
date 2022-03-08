import React from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Statistic } from 'antd';
import { formatID } from '../../utils/format';

export interface BuyModalDetailProps {
  order: any;
  onChangeStep: any;
  connection: Connection;
  walletPublicKey: PublicKey;
  walletConnectComponent: React.ReactElement;
}

const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  onChangeStep,
  connection,
  walletPublicKey,
  walletConnectComponent,
}) => {
  console.log('BuyModalDetail', connection);

  return (
    <>
      <div className="buy-modal-thumbnail">
        <img src={order?.nftImageLink} />
      </div>
      <div className="buy-modal-container">
        <div className="buy-modal-title">{order?.name}</div>
        <div className="buy-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <Statistic suffix="SOL" value={order?.price} precision={2} valueStyle={{ fontSize: 16, fontWeight: 'bold' }} />
          </div>
          {!walletPublicKey ?
            walletConnectComponent
            : (
            <button className="candy-button buy-modal-button" onClick={() => onChangeStep(1)}>Buy Now</button>
          )}
        </div>
        <div className="buy-modal-description">
          <div className="candy-label">DESCRIPTION</div>
          <div className="candy-content">{order?.nftDescription}</div>
        </div>
        <div className="buy-modal-info">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="buy-modal-info-value color-purple">
              {formatID(order?.tokenMint)}
            </div>
          </div>
          <div>
            <div className="candy-label">TOKEN ID</div>
            <div className="buy-modal-info-value">{order?.edition}</div>
          </div>
          <div>
            <div className="candy-label">OWNER</div>
            <div className="buy-modal-info-value color-purple">
              {formatID(order?.walletAddress)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyModalDetail;
