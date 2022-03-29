import React from 'react';
import IconTick from '../../assets/IconTick';
import imgDefault from '../../assets/img-default.png';

import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import styled from '@emotion/styled';

export interface CancelModalConfirmProps {
  order: OrderSchema;
  onCancel: (...args: any) => void;
}

export const CancelModalConfirm = ({
  order,
  onCancel,
}: CancelModalConfirmProps): JSX.Element => {
  return (
    <Container className="candy-container">
      <div className="candy-title">
        <IconTick />
      </div>
      <div className="cds-cancel-modal-confirm-content">
        <img src={order.nftImageLink || imgDefault} alt="" />
        <div className="candy-title">
          {order.name} is no longer listed for sale
        </div>
      </div>
      <div className="cds-cancel-modal-confirm-success">
        <button className="candy-button" onClick={onCancel}>
          View listing
        </button>
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  padding: 20px 80px;

  .cds-cancel-modal-confirm {
    &-content {
      display: flex;
      align-items: center;
      padding-bottom: 40px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 40px;

      .candy-title {
        margin-bottom: unset;
      }

      img {
        max-width: 100px;
        max-height: 100px;
        margin-right: 15px;
      }
    }
    &-success {
      width: 100%;
      .candy-button {
        width: 100%;
      }
    }
  }
`;
