import React, { useCallback, useState } from 'react';
import { Card } from 'antd';
import { SellModal } from '../SellModal';
import { LiqImage } from '../LiqImage';
import { SingleTokenInfo } from '../../api/fetchMetadata';
import { CandyShop } from '../../core/CandyShop';

export const Nft = ({
  nft,
  candyShop,
}: {
  nft: SingleTokenInfo;
  candyShop: CandyShop;
}) => {
  const [selection, setSelection] = useState<SingleTokenInfo | undefined>();

  const onClose = useCallback(() => {
    setSelection(undefined);
  }, []);

  const onClick = useCallback(() => {
    setSelection(nft);
  }, [nft]);

  // TODO: check NFT label condition
  const isShowSaleLabel = false;

  return (
    <>
      <Card className="vault-list-item" onClick={onClick}>
        {isShowSaleLabel && (
          <div className="vault-status-tag">Listed for Sale</div>
        )}
        {/* TODO: Implement the cancel order modal that calls the CandyShop.cancel order method. See Figma https://www.figma.com/file/MbmAKbgf5LvDAGJqLIByBx/Liquid-NFT-homepage?node-id=2669%3A19156 */}
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
      {selection && (
        <SellModal onCancel={onClose} nft={selection} candyShop={candyShop} />
      )}
    </>
  );
};
