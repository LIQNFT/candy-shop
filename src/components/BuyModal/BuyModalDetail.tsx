import styled from '@emotion/styled';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { ExplorerLink } from 'components/ExplorerLink';
import React, { useMemo } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

export interface BuyModalDetailProps {
  order: OrderSchema;
  buy: () => {};
  walletPublicKey: PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
}

const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
}) => {
  const orderPrice = useMemo(() => {
    if (!order) return 0;
    return (Number(order?.price) / LAMPORTS_PER_SOL).toFixed(2);
  }, [order]);

  return (
    <>
      <div className="buy-modal-thumbnail">
        <img src={order?.nftImageLink || ''} alt="" />
      </div>
      <div className="buy-modal-container">
        <div className="buy-modal-title">{order?.name}</div>
        <div className="buy-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <Price>{orderPrice} SOL</Price>
          </div>
          {!walletPublicKey ? (
            walletConnectComponent
          ) : (
            <button className="candy-button buy-modal-button" onClick={buy}>
              Buy Now
            </button>
          )}
        </div>
        <div className="buy-modal-description">
          <div className="candy-label">DESCRIPTION</div>
          <div className="candy-value">{order?.nftDescription}</div>
        </div>
        <div className="buy-modal-info">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order?.tokenMint} />
            </div>
          </div>
          <div className="buy-modal-info-line" />
          {order?.edition ? (
            <>
              <div>
                <div className="candy-label">EDITION</div>
                <div className="candy-value">{order?.edition}</div>
              </div>
              <div className="buy-modal-info-line" />
            </>
          ) : null}
          <div>
            <div className="candy-label">OWNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order?.walletAddress} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyModalDetail;

const Price = styled.div`
  font-size: 16px;
  font-weight: bold;
`;
