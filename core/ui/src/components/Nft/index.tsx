import { SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';

import { Card } from 'components/Card';

import React from 'react';

import './index.less';

export interface NftProps {
  nft: SingleTokenInfo;
  sellDetail?: OrderSchema;
}

export const Nft = ({ nft, sellDetail }: NftProps): JSX.Element => {
  return (
    <Card
      name={nft?.metadata?.data?.name}
      ticker={nft?.metadata?.data?.symbol}
      imgUrl={nft?.nftImage}
      label={sellDetail ? <div className="candy-status-tag">Listed for Sale</div> : undefined}
    />
  );
};
