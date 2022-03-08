import { Modal } from 'antd';
import React from 'react';

import './style.less';

export interface IBuyModal {
  order: any;
  isConnectWallet: boolean;
  onClose: any;
}
const BuyModal = ({ onClose, order, isConnectWallet }: IBuyModal) => {
  return (
    <Modal visible onCancel={onClose}>
      <div className="buy-modal">
        <div className="buy-modal-thumbnail">
          <img src={order?.nftImageLink || 'https://via.placeholder.com/300'} />
        </div>
        <div className="buy-modal-container">
          <p>artist_name</p>
          <div className="buy-modal-title">{order?.ticker}</div>
          <div className="buy-modal-control">
            <div>
              <p>CURRENT PRICE</p>
              <div className="buy-modal-price">
                {(+order?.price / 10e9).toFixed(3)} SOL
              </div>
            </div>
            {!isConnectWallet ? (
              <button>Connect wallet to buy</button>
            ) : (
              <button>Buy now</button>
            )}
          </div>
          <div>
            <p>DESCRIPTION</p>
            <div className="buy-modal-price">
              {(+order.price / 10e9).toFixed(3)} SOL
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BuyModal;
