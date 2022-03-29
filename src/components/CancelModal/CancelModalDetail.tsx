import React from 'react';
import styled from '@emotion/styled';

import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { CandyShop } from '../../core/CandyShop';
import { BN } from '@project-serum/anchor';

import { ExplorerLink } from '../ExplorerLink';
import { errorNotification } from '../../utils/notification';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { breakPoints } from '../../constant/breakPoints';

import imgDefault from '../../assets/img-default.png';

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
  const cancel = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    onChangeStep(1);
    candyShop
      .cancel(
        new PublicKey(order.tokenAccount),
        new PublicKey(order.tokenMint),
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
    <Container>
      <div className="cds-cancel-modal-thumbnail">
        <img src={order.nftImageLink || imgDefault} alt="" />
      </div>

      <div className="cds-cancel-modal-container">
        <div className="cds-cancel-modal-title">{order.name}</div>
        <div className="cds-cancel-modal-control">
          <div>
            <div className="candy-label">SELLING PRICE</div>
            <Statistic>
              {((order.price as any) / LAMPORTS_PER_SOL || 0).toFixed(2)} SOL
            </Statistic>
          </div>
          <button
            className="candy-button cds-cancel-modal-button"
            onClick={cancel}
          >
            {buttonContent}
          </button>
        </div>
        <div className="cds-cancel-modal-description">
          <div className="candy-label">DESCRIPTION</div>
          <div className="candy-value">{order.nftDescription}</div>
        </div>
        <div className="cds-cancel-modal-info">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.tokenMint} />
            </div>
          </div>
          <div className="cds-cancel-modal-info-line" />
          <div>
            <div className="candy-label">TOKEN ID</div>
            <div className="candy-value">{order.edition || 'N/A'}</div>
          </div>
          <div className="cds-cancel-modal-info-line" />
          <div>
            <div className="candy-label">CURRENT OWNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.tokenAccount} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

const Statistic = styled.div`
  font-weight: 600;
`;

const Container = styled.div`
  display: flex;

  .cds-cancel-modal {
    font-family: 'Work Sans', Helvetica, Arial, sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;

    &-thumbnail {
      display: flex;
      align-items: center;

      img {
        max-width: 340px;
        max-height: 340px;
        margin-right: 48px;
      }

      @media ${breakPoints.desktopS} {
        img {
          max-width: 240px;
          max-height: 240px;
          margin-right: 32px;
        }
      }

      @media ${breakPoints.tabletS} {
        img {
          max-width: 160px;
          max-height: 160px;
          margin-right: 24px;
        }
      }
    }

    &-title {
      font-size: 32px;
      font-weight: 600;
    }

    &-container {
      width: 100%;
      padding-top: 40px;

      @media ${breakPoints.desktopS} {
        padding-top: 0;
      }
    }

    &-control {
      display: flex;
      justify-content: space-between;
      margin: 24px 0;

      @media ${breakPoints.desktopS} {
        margin: 12px 0;
      }
    }

    &-info {
      margin-top: 24px;
      display: flex;
      gap: 32px;

      &-line {
        width: 2px;
        background-color: #bdbdbd;
        align-self: stretch;
      }
    }

    &-button {
      padding: 5px 100px;
      border-radius: 100px;
      height: unset;

      @media ${breakPoints.tabletL} {
        padding: 4px 50px;
      }
    }
  }
`;
