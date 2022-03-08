import React, { useCallback, useState } from 'react';
import { Card } from 'antd';
import { SellModal } from '../SellModal';
import { LiqImage } from '../LiqImage';

export const Nft = ({ nft }: { nft: any }) => {
  const [selection, setSelection] = useState();

  const onClose = useCallback(() => {
    setSelection(undefined);
  }, []);

  const onClick = useCallback(() => {
    setSelection(nft);
  }, [nft]);

  return (
    <>
      <Card className="vault-list-item" onClick={onClick}>
        <LiqImage alt={nft?.metadata.data.name} src={nft?.nftImage} />
        <div className="vault-list-item-body">
          <div className="vault-list-item-header">
            <div
              className="vault-name"
              style={{ verticalAlign: 'middle', fontWeight: 'bold', marginBottom: '2px' }}
            >
              {nft?.metadata?.data?.name}
              <div className="subtitle">{nft?.metadata?.data?.symbol}</div>
            </div>
          </div>
        </div>
      </Card>
      {selection && <SellModal onCancel={onClose} nft={selection} />}
    </>
  );
};