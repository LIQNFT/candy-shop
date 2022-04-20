import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { CancelModal } from 'components/CancelModal';
import { LiqImage } from 'components/LiqImage';
import { SellModal } from 'components/SellModal';

import { CandyShop, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import {
  Order as OrderSchema,
  CandyShop as CandyShopResponse
} from 'solana-candy-shop-schema/dist';

import './index.less';

export interface NftProps {
  nft: SingleTokenInfo;
  candyShop: CandyShop;
  wallet: AnchorWallet;
  sellDetail?: OrderSchema;
  shop: CandyShopResponse;
  connection: web3.Connection;
}

export const Nft = ({
  nft,
  candyShop,
  wallet,
  sellDetail,
  shop,
  connection
}: NftProps): JSX.Element => {
  const [selection, setSelection] = useState<SingleTokenInfo | undefined>();

  const onClose = () => {
    setSelection(undefined);
  };

  const onClick = () => {
    setSelection(nft);
  };

  const isSellItem = Boolean(sellDetail);

  return (
    <>
      <div className="candy-card-border candy-nft-card" onClick={onClick}>
        {isSellItem && <div className="candy-status-tag">Listed for Sale</div>}

        <LiqImage
          src={nft?.nftImage}
          alt={nft?.metadata?.data?.name}
          fit="cover"
          style={{ borderTopRightRadius: 14, borderTopLeftRadius: 14 }}
        />

        <div className="candy-nft-info">
          <div className="name">{nft?.metadata?.data?.name}</div>
          <div className="ticker">{nft?.metadata?.data?.symbol}</div>
        </div>
      </div>

      {selection && !isSellItem && (
        <SellModal
          onCancel={onClose}
          nft={selection}
          candyShop={candyShop}
          wallet={wallet}
          shop={shop}
          connection={connection}
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
