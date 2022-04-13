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
    <Container>
      <div className="candy-cancel-modal-confirm-title">
        <IconTick />
      </div>
      <div className="candy-cancel-modal-confirm-content">
        <div className="candy-cancel-modal-confirm-content-img">
          <LiqImage src={order.nftImageLink} alt={order.name} fit="contain" />
        </div>
        <div className="candy-cancel-modal-confirm-content-text">
          <span style={{ fontWeight: 'bold' }}>{order.name}</span> is no longer
          listed for sale
        </div>
      </div>
      <div className="candy-cancel-modal-confirm-success">
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
  margin-left: auto;
  margin-right: auto;

  @media only screen and (max-width: 600px) {
    padding-left: 15px;
    padding-right: 15px;
  }

  .candy-cancel-modal-confirm {
    &-title {
      font-weight: bold;
      font-size: 26px;
      line-height: 36px;
      margin-bottom: 42px;
      text-align: center;
    }

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
