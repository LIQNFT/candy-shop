import React from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Statistic } from 'antd';
import { ExplorerLink } from '../ExplorerLink';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CandyShop } from '../../core/CandyShop';

export interface BuyModalDetailProps {
  order: OrderSchema;
  buy: () => {};
  walletPublicKey: PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
}

const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
}) => {
  return (
    <>
      <div className="buy-modal-thumbnail">
        <img src={order?.nftImageLink || ''} />
      </div>
      <div className="buy-modal-container">
        <div className="buy-modal-title">{order?.name}</div>
        <div className="buy-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <Statistic
              suffix="SOL"
              value={(order?.price as any) / LAMPORTS_PER_SOL}
              precision={2}
              valueStyle={{ fontSize: 16, fontWeight: 'bold' }}
            />
          </div>
          {!walletPublicKey ? (
            walletConnectComponent
          ) : (
            <button className="candy-button buy-modal-button" onClick={buy}>
              Buy Now
            </button>
          )}
        </div>
        <div className="buy-modal-description">
          <div className="candy-label">DESCRIPTION</div>
          <div className="candy-value">{order?.nftDescription}</div>
        </div>
        <div className="buy-modal-info">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order?.tokenMint} />
            </div>
          </div>
          <div className="buy-modal-info-line" />
          {order?.edition ? (
            <>
              <div>
                <div className="candy-label">EDITION</div>
                <div className="candy-value">{order?.edition}</div>
              </div>
              <div className="buy-modal-info-line" />
            </>
          ) : null}
          <div>
            <div className="candy-label">OWNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order?.walletAddress} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyModalDetail;
