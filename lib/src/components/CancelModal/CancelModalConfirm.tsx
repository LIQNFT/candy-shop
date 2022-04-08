import styled from '@emotion/styled';
import IconTick from 'assets/IconTick';
import React from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import imgDefault from '../../assets/img-default.png';

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
        <div className="cds-cancel-modal-confirm-content-img">
          <img src={order.nftImageLink || imgDefault} alt="" />
        </div>
        <div className="cds-cancel-modal-confirm-content-text">
          {order.name} is no longer listed for sale
        </div>
      </div>
      <div className="cds-cancel-modal-confirm-success">
        <button className="candy-button" onClick={onCancel}>
          Continue Browsing
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

      &-img {
        width: 100px;
        height: 100px;
        margin-right: 15px;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
        border-radius: 10px;
      }

      &-text {
        align-self: flex-start;
        flex: 1;
        font-weight: bold;
        font-size: 26px;
        line-height: 36px;
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
