import React from 'react';
import IconTick from '../../assets/IconTick';
import imgDefault from '../../assets/img-default.png';

import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import './style.less';

export const CancelModalConfirm = ({
  order,
  onCancel,
}: {
  order: OrderSchema;
  onCancel: (...args: any) => void;
}) => {
  return (
    <div className="candy-container">
      <div className="candy-title">
        <IconTick />
      </div>
      <div className="cancel-modal-confirm-content">
        <img src={order.nftImageLink || imgDefault} alt="" />
        <div className="candy-title">
          {order.name} is no longer listed for sale
        </div>
      </div>
      <div className="cancel-modal-confirm-success">
        <button className="candy-button" onClick={onCancel}>
          View listing
        </button>
      </div>
    </div>
  );
};
