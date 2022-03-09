import React from 'react';
import { formatID } from '../../helps/format';

export interface BuyModalContent {
  order: any;
  isConnectWallet: boolean;
}

const Content = ({ order, isConnectWallet }: BuyModalContent) => {
  return (
    <>
      <div className="buy-modal-thumbnail">
        <img src={order?.nftImageLink || 'https://via.placeholder.com/300'} />
      </div>
      <div className="buy-modal-container">
        <div className="buy-modal-title">{order?.name}</div>
        <div className="buy-modal-control">
          <div>
            <p className="label">CURRENT PRICE</p>
            <div className="buy-modal-price">
              {(+order?.price / 10e9).toFixed(3)} SOL
            </div>
          </div>
          {!isConnectWallet ? (
            <button className="buy-modal-button">Buy now</button>
          ) : (
            <button className="buy-modal-button">Buy now</button>
          )}
        </div>
        <div className="buy-modal-description">
          <p className="label">DESCRIPTION</p>
          <div>{order?.nftDescription}</div>
        </div>
        <div className="buy-modal-info">
          <div>
            <p className="label">MINT ADDRESS</p>
            <div className="buy-modal-info-value color-purple">
              {formatID(order?.tokenMint)}
            </div>
          </div>
          <div>
            <p className="label">TOKEN ID</p>
            <div className="buy-modal-info-value">{order?.edition}</div>
          </div>
          <div>
            <p className="label">CURRENT OWNER</p>
            <div className="buy-modal-info-value color-purple">
              {formatID(order?.walletAddress)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Content;
