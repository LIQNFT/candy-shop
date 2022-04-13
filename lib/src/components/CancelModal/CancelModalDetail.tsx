import styled from '@emotion/styled';
import { BN, web3 } from '@project-serum/anchor';
import { ExplorerLink } from 'components/ExplorerLink';
import { breakPoints } from 'constant/breakPoints';
import { CandyShop } from 'core/CandyShop';
import React from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { notification } from 'utils/rc-notification';
import { LiqImage } from '../LiqImage';
import './style.less';

export interface CancelModalDetailProps {
  onCancel: any;
  candyShop: CandyShop;
  order: OrderSchema;
  // eslint-disable-next-line no-unused-vars
  onChangeStep: (...args: any) => void;
}

export const CancelModalDetail = ({
  candyShop,
  order,
  onChangeStep,
}: CancelModalDetailProps): JSX.Element => {
  const cancel = async () => {
    onChangeStep(1);
    candyShop
      .cancel(
        new web3.PublicKey(order.tokenAccount),
        new web3.PublicKey(order.tokenMint),
        new BN(order.price)
      )
      .then(() => {
        onChangeStep(2);
      })
      .catch(() => {
        notification('Transaction failed. Please try again later.', 'error');
      });
  };

  const buttonContent = 'Cancel listing';

  return (
    <div className="candy-cancel-modal">
      <div className="candy-cancel-modal-thumbnail">
        <LiqImage src={order.nftImageLink} alt={order?.name} fit="contain" />
      </div>

      <div className="candy-cancel-modal-container">
        <div className="candy-title">{order.name}</div>
        <div className="candy-cancel-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <div className="candy-price">
              {((order.price as any) / web3.LAMPORTS_PER_SOL || 0).toFixed(2)}{' '}
              SOL
            </div>
          </div>
          <button
            className="candy-button candy-cancel-modal-button"
            onClick={cancel}
          >
            {buttonContent}
          </button>
        </div>
        {order?.nftDescription && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order.nftDescription}</div>
          </div>
        )}
        <div className="candy-stat-horizontal">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.tokenMint} />
            </div>
          </div>
          {order?.edition ? (
            <>
              <div className="candy-stat-horizontal-line" />
              <div>
                <div className="candy-label">EDITION</div>
                <div className="candy-value">{order?.edition}</div>
              </div>
            </>
          ) : null}
          <div className="candy-stat-horizontal-line" />
          <div>
            <div className="candy-label">CURRENT OWNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.tokenAccount} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
