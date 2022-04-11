import styled from '@emotion/styled';
import React, { useMemo } from 'react';
import { web3 } from "@project-serum/anchor";
import IconTick from '../../assets/IconTick';
import imgDefault from '../../assets/img-default.png';
import { formatDate } from '../../utils/format';
import { ExplorerLink } from '../ExplorerLink';

const BuyModalConfirmed = ({
  order,
  txHash,
  walletPublicKey,
}: {
  order: any;
  txHash: string;
  walletPublicKey: web3.PublicKey | undefined;
}) => {
  // Get wallet address follow walletPublicKey
  const walletAddress = useMemo(
    () => walletPublicKey?.toBase58() || '',
    [walletPublicKey]
  );

  return (
    <div className="buy-modal-confirmed">
      <div className="buy-modal-confirmed-header">
        <IconTick />
        <div>Transaction confirmed</div>
      </div>
      <div className="buy-modal-confirmed-container">
        <div className="buy-modal-confirmed-thumbnail">
          <img src={order?.nftImageLink || imgDefault} alt="" />
        </div>
        <div className="buy-modal-confirmed-content">
          <div>
            <div>{order?.ticker}</div>
            <div className="buy-modal-price">{order?.name}</div>
          </div>
          <div>
            <div className="buy-modal-price">
              {(+order?.price / 10e9).toFixed(3)} SOL
            </div>
          </div>
        </div>
      </div>
      <hr />
      <Flex>
        <Item>
          <div className="candy-label">FROM</div>
          <div className="candy-value">
            <ExplorerLink type="address" address={order.walletAddress} />
          </div>
        </Item>
        <Item>
          <div className="candy-label">TO</div>
          <div className="candy-value">
            <ExplorerLink type="address" address={walletAddress} />
          </div>
        </Item>
        <Item>
          <div className="candy-label">TRANSACTION HASH</div>
          <div className="candy-value">
            <ExplorerLink type="tx" address={txHash} />
          </div>
        </Item>
        <Item>
          <div className="candy-label">TRANSACTION CONFIRMED ON</div>
          <div className="candy-value">{formatDate(new Date())}</div>
        </Item>
      </Flex>
      <button
        className="candy-button"
        onClick={() => {
          window.location.reload();
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default BuyModalConfirmed;

const Flex = styled.div`
  display: flex;
  flex-flow: row wrap;
  row-gap: 24px;
  column-gap: 16px;
  > * {
    width: calc((100% - 16px) / 2);
  }
`;

const Item = styled.div``;
