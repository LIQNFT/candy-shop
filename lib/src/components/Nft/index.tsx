import styled from '@emotion/styled';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CancelModal } from 'components/CancelModal';
import { LiqImage } from 'components/LiqImage';
import { SellModal } from 'components/SellModal';
import { CandyShop, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import React, { useCallback, useState } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

export interface NftProps {
  nft: SingleTokenInfo;
  candyShop: CandyShop;
  wallet: AnchorWallet;
  sellDetail?: OrderSchema;
}

export const Nft = ({
  nft,
  candyShop,
  wallet,
  sellDetail,
}: NftProps): JSX.Element => {
  const [selection, setSelection] = useState<SingleTokenInfo | undefined>();

  const onClose = useCallback(() => {
    setSelection(undefined);
  }, []);

  const onClick = useCallback(() => {
    setSelection(nft);
  }, [nft]);

  const isSellItem = Boolean(sellDetail);

  return (
    <>
      <Card onClick={onClick}>
        {isSellItem && <div className="vault-status-tag">Listed for Sale</div>}

        <LiqImage
          src={nft?.nftImage}
          alt={nft?.metadata?.data?.name}
          fit="cover"
          style={{ borderTopRightRadius: 14, borderTopLeftRadius: 14 }}
        />
        <div className="vault-list-item-body">
          <div className="vault-list-item-header">
            <CardName>
              <div className="name">{nft?.metadata?.data?.name}</div>
              <div className="ticker">{nft?.metadata?.data?.symbol}</div>
            </CardName>
          </div>
        </div>
      </Card>

      {selection && !isSellItem && (
        <SellModal
          onCancel={onClose}
          nft={selection}
          candyShop={candyShop}
          wallet={wallet}
        />
      )}

      {selection && sellDetail ? (
        <CancelModal
          onClose={onClose}
          candyShop={candyShop}
          order={sellDetail}
          wallet={wallet}
        />
      ) : null}
    </>
  );
};

const Card = styled.div`
  border: 2px solid black;
  border-radius: 16px;
  height: auto;
  position: relative;
  z-index: 3;
`;

const CardName = styled.div`
  vertical-align: middle;
  padding: 12px;
  background-color: #fff;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  .name {
    font-weight: bold;
    font-size: 16px;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .ticker {
    font-size: 14px;
    text-align: left;
    font-weight: 400;
    height: 22px;
  }
`;
