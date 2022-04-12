import styled from '@emotion/styled';
import IconTick from 'assets/IconTick';
import React from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { LiqImage } from '../LiqImage';

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
          <LiqImage
            src={order.nftImageLink || imgDefault}
            alt="NFT Image"
            style={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
          />
        </div>
        <div className="cds-cancel-modal-confirm-content-text">
          <span style={{ fontWeight: 'bold' }}>{order.name}</span> is no longer
          listed for sale
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
  padding: 20px;

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
        font-size: 24px;
        line-height: 34px;
      }
    }

    &-success {
      width: 100%;

      .candy-button {
        padding-top: 8px;
        padding-bottom: 8px;
        width: 100%;
      }
    }
  }
`;
