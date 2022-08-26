import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import IconTick from 'assets/IconTick';
import React from 'react';
import { LiqImage } from '../LiqImage';

export interface CancelModalConfirmProps {
  order?: OrderSchema;
  onCancel: (...args: any) => void;
}

export const CancelModalConfirm = ({ order, onCancel }: CancelModalConfirmProps): JSX.Element => {
  return (
    <div className="candy-cancel-modal-confirm-container">
      <div className="candy-cancel-modal-confirm-title">
        <IconTick />
      </div>
      <div className="candy-cancel-modal-confirm-content">
        <div className="candy-cancel-modal-confirm-content-img">
          <LiqImage src={order?.nftImageLink} alt={order?.name} fit="contain" />
        </div>
        <div className="candy-cancel-modal-confirm-content-text">
          <span style={{ fontWeight: 'bold' }}>{order?.name}</span> is no longer listed for sale
        </div>
      </div>
      <div className="candy-cancel-modal-confirm-success">
        <button className="candy-button" onClick={onCancel}>
          Continue Browsing
        </button>
      </div>
    </div>
  );
};
