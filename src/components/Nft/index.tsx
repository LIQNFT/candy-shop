import React, { useCallback, useState } from 'react';
import { Card } from 'antd';
import { SellModal } from '../SellModal';
import { CancelModal } from '../CancelModal';
import { LiqImage } from '../LiqImage';
import { SingleTokenInfo } from '../../api/fetchMetadata';
import { CandyShop } from '../../core/CandyShop';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

export const Nft = ({
  nft,
  candyShop,
  sellDetail,
}: {
  nft: SingleTokenInfo;
  candyShop: CandyShop;
  sellDetail?: OrderSchema;
}) => {
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
      <Card className="vault-list-item" onClick={onClick}>
        {isSellItem && <div className="vault-status-tag">Listed for Sale</div>}

        <LiqImage alt={nft?.metadata?.data?.name} src={nft?.nftImage} />
        <div className="vault-list-item-body">
          <div className="vault-list-item-header">
            <div
              className="vault-name"
              style={{
                verticalAlign: 'middle',
                fontWeight: 'bold',
                marginBottom: '2px',
              }}
            >
              {nft?.metadata?.data?.name}
              <div className="subtitle">{nft?.metadata?.data?.symbol}</div>
            </div>
          </div>
        </div>
      </Card>
      {selection && !isSellItem && (
        <SellModal onCancel={onClose} nft={selection} candyShop={candyShop} />
      )}
      {selection && sellDetail ? (
        <CancelModal
          onClose={onClose}
          candyShop={candyShop}
          order={sellDetail}
        />
      ) : null}
    </>
  );
};
