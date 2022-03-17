import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Statistic } from 'antd';
import React from 'react';

import { CandyShop } from '../../core/CandyShop';
import { ExplorerLink } from '../ExplorerLink';
import { BN } from '@project-serum/anchor';
import { errorNotification } from '../../utils/notification';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import imgDefault from '../../assets/img-default.png';

import './style.less';

export const CancelModalDetail = ({
  onCancel,
  candyShop,
  order,
  onChangeStep,
}: {
  onCancel: any;
  candyShop: CandyShop;
  order: OrderSchema;

  onChangeStep: (...args: any) => void;
}) => {
  // List for sale and move to next step
  const cancel = async () => {
    onChangeStep(1);
    candyShop
      .cancel(
        new PublicKey(order.tokenAccount),
        new PublicKey(order.tokenMint),
        candyShop.treasuryMint(),
        new BN(order.price)
      )
      .then(() => {
        onChangeStep(2);
      })
      .catch(() => {
        errorNotification(
          new Error('Transaction failed. Please try again later.')
        );
      });
  };

  const buttonContent = 'Cancel listing';

  return (
    <>
      <div className="cancel-modal-thumbnail">
        <img src={order.nftImageLink || imgDefault} alt="" />
      </div>

      <div className="cancel-modal-container">
        <div className="cancel-modal-title">{order.name}</div>
        <div className="cancel-modal-control">
          <div>
            <div className="candy-label">SELLING PRICE</div>
            <Statistic
              suffix="SOL"
              value={(order.price as any) / LAMPORTS_PER_SOL}
              precision={2}
              valueStyle={{ fontSize: 16, fontWeight: 'bold' }}
            />
          </div>
          <button className="candy-button cancel-modal-button" onClick={cancel}>
            {buttonContent}
          </button>
        </div>
        <div className="cancel-modal-description">
          <div className="candy-label">DESCRIPTION</div>
          <div className="candy-value">{order.nftDescription}</div>
        </div>
        <div className="cancel-modal-info">
          <div className="cancel-modal-info-col">
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.tokenMint} />
            </div>
          </div>
          <div className="cancel-modal-info-line" />
          <div className="cancel-modal-info-col">
            <div className="candy-label">TOKEN ID</div>
            <div className="candy-value">{order.edition || 0}</div>
          </div>
          <div className="cancel-modal-info-line" />
          <div className="cancel-modal-info-col">
            <div className="candy-label">CURRENT OWNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.tokenAccount} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
