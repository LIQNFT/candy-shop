import React from 'react';
import styled from '@emotion/styled';

import { ExplorerLink } from 'components/ExplorerLink';
import { WhitelistNft } from 'solana-candy-shop-schema/dist';

export interface WhitelistModalProps {
  collection: WhitelistNft;
  onClose: () => void;
}

export const WhitelistDetail: React.FC<WhitelistModalProps> = ({
  collection,
  onClose,
}) => {
  return (
    <Content>
      <div className="cds-wl-title">Whitelist Collections</div>
      <p className="cds-wl-description">{DESCRIPTION}</p>

      <Collection>
        <div className="cds-wl-row">
          <div className="cds-wl-row-key">Mint address:</div>
          <ExplorerLink type="address" address={collection.tokenMint} />
        </div>
        <div className="cds-wl-row">
          <div className="cds-wl-row-key">Collection symbol:</div>
          <div>{collection.symbol}</div>
        </div>
        <div className="cds-wl-row">
          <div className="cds-wl-row-key">Creator address:</div>
          <ExplorerLink
            type="address"
            address={collection.creators[0].address}
          />
        </div>
      </Collection>

      <Button className="candy-button" onClick={onClose}>
        Whitelist collection(s)
      </Button>
    </Content>
  );
};

const DESCRIPTION =
  'Please verify the collection details listed below and proceed to whitelist collections.';

const Content = styled.div`
  padding: 40px 20px 10px;
  display: flex;
  align-items: center;
  flex-direction: column;

  .cds-wl {
    &-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    &-description {
      font-weight: 700;
    }
  }
`;
const Collection = styled.div`
  display: flex;
  margin: 30px 0;
  flex-direction: column;
  width: 100%;

  .cds-wl-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    &-key {
      font-weight: 700;
      font-size: 18px;
    }
  }
`;

const Button = styled.div`
  text-align: center;
  padding: 6px 0;
  margin-top: 20px;
  font-weight: 700;
  width: 100%;
`;
