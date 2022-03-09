import React from 'react';
import IconWallet from '../../assets/IconWallet';
import { formatID } from '../../helps/format';

export interface BuyModalContent {
  order: any;
  isConnectWallet: boolean;
  onChangeStep: any;
}

const Content = ({ order, isConnectWallet, onChangeStep }: BuyModalContent) => {
  return (
    <>
      <div className="buy-modal-thumbnail">
        <img src={order?.nftImageLink || 'https://via.placeholder.com/300'} />
      </div>
      <div className="buy-modal-container">
        <div className="buy-modal-title">{order?.name}</div>
        <div className="buy-modal-control">
          <div>
            <p className="candy-label">CURRENT PRICE</p>
            <div className="candy-value buy-modal-price">
              {(+order?.price / 10e9).toFixed(3)} SOL
            </div>
          </div>
          {!isConnectWallet ? (
            <button
              className="candy-button buy-modal-button"
              // TEMP - To change step
              onClick={() => onChangeStep(1)}
            >
              <IconWallet /> Connect wallet to buy
            </button>
          ) : (
            <button className="candy-button buy-modal-button">Buy now</button>
          )}
        </div>
        <div className="buy-modal-description">
          <p className="candy-label">DESCRIPTION</p>
          <div>{order?.nftDescription}</div>
        </div>
        <div className="buy-modal-info">
          <div>
            <p className="candy-label">MINT ADDRESS</p>
            <div className="buy-modal-info-value color-purple">
              {formatID(order?.tokenMint)}
            </div>
          </div>
          <div>
            <p className="candy-label">TOKEN ID</p>
            <div className="buy-modal-info-value">{order?.edition}</div>
          </div>
          <div>
            <p className="candy-label">CURRENT OWNER</p>
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
