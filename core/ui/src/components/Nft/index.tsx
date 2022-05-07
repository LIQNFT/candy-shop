import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CancelModal } from 'components/CancelModal';
import { SellModal } from 'components/SellModal';
import { Card } from 'components/Card';

import { SingleTokenInfo, CandyShop } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema, CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';

import './index.less';
import { getExchangeInfo } from 'utils/getExchangeInfo';

export interface NftProps {
  nft: SingleTokenInfo;
  wallet: AnchorWallet;
  sellDetail?: OrderSchema;
  shop: CandyShopResponse;
  candyShop: CandyShop;
}

export const Nft = ({ nft, wallet, sellDetail, shop, candyShop }: NftProps): JSX.Element => {
  const [selection, setSelection] = useState<SingleTokenInfo | undefined>();

  const onClose = () => {
    setSelection(undefined);
  };

  const onClick = () => {
    setSelection(nft);
  };

  const exchangeInfo = sellDetail
    ? getExchangeInfo(sellDetail, candyShop)
    : {
        symbol: candyShop.currencySymbol,
        decimals: candyShop.currencyDecimals
      };

  return (
    <>
      <Card
        name={nft?.metadata?.data?.name}
        ticker={nft?.metadata?.data?.symbol}
        imgUrl={nft?.nftImage}
        label={sellDetail ? <div className="candy-status-tag">Listed for Sale</div> : undefined}
        onClick={onClick}
      />

      {selection && !sellDetail && (
        <SellModal onCancel={onClose} nft={selection} candyShop={candyShop} wallet={wallet} shop={shop} />
      )}

      {selection && sellDetail ? (
        <CancelModal
          onClose={onClose}
          order={sellDetail}
          wallet={wallet}
          candyShop={candyShop}
          exchangeInfo={exchangeInfo}
        />
      ) : null}
    </>
  );
};
