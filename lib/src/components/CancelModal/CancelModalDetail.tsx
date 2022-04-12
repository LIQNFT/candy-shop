import styled from '@emotion/styled';
import { BN, web3 } from '@project-serum/anchor';
import { ExplorerLink } from 'components/ExplorerLink';
import { breakPoints } from 'constant/breakPoints';
import { CandyShop } from 'core/CandyShop';
import React from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { notification } from 'utils/rc-notification';
import { LiqImage } from '../LiqImage';

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
    <Container>
      <div className="cds-cancel-modal-thumbnail">
        <LiqImage
          src={order.nftImageLink}
          alt="NFT Image"
          style={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
        />
      </div>

      <div className="cds-cancel-modal-container">
        <div className="cds-cancel-modal-title">{order.name}</div>
        <div className="cds-cancel-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <Statistic>
              {((order.price as any) / web3.LAMPORTS_PER_SOL || 0).toFixed(2)}{' '}
              SOL
            </Statistic>
          </div>
          <button
            className="candy-button cds-cancel-modal-button"
            onClick={cancel}
          >
            {buttonContent}
          </button>
        </div>
        {order?.nftDescription && (
          <div className="cds-cancel-modal-description">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order.nftDescription}</div>
          </div>
        )}
        <div className="cds-cancel-modal-info">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.tokenMint} />
            </div>
          </div>
          {order?.edition ? (
            <>
              <div className="cds-cancel-modal-info-line" />
              <div>
                <div className="candy-label">EDITION</div>
                <div className="candy-value">{order?.edition}</div>
              </div>
            </>
          ) : null}
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
  font-size: 16px;
`;

const Container = styled.div`
  display: flex;

  .cds-cancel-modal {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;

    &-thumbnail {
      width: 340px;
      height: 340px;
      margin-right: 24px;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      @media ${breakPoints.desktopS} {
        width: 240px;
        height: 240px;
        margin-right: 12px;

        img {
          border-radius: 10px;
        }
      }

      @media ${breakPoints.tabletS} {
        width: 160px;
        height: 160px;
      }
    }

    &-container {
      flex: 1;
      padding-top: 30px;

      @media ${breakPoints.desktopS} {
        padding-top: 0;
      }
    }

    &-title {
      text-align: left;
      font-size: 24px;
      font-weight: 600;
    }

    &-control {
      display: flex;
      text-align: left;
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
      text-align: left;

      &-line {
        width: 1px;
        background-color: #bdbdbd;
        align-self: stretch;
      }

      .candy-value {
        font-size: 16px;
        font-weight: 500;
      }
    }

    &-description {
      text-align: left;
      font-size: 16px;
      font-weight: 500;
    }

    &-button {
      padding: 8px 50px;
      border-radius: 32px;
      height: unset;
      font-size: 16px;

      @media ${breakPoints.tabletL} {
        padding: 4px 50px;
      }
    }
  }
`;
