import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { CandyShopFake, order } from '../../stories/mocks';
import { CancelModalDetail } from './CancelModalDetail';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

export default {
  title: 'CancelModalDetail',
  component: CancelModalDetail,
} as ComponentMeta<typeof CancelModalDetail>;

export const Primary = (): JSX.Element => {
  const wallet = useAnchorWallet();
  if (wallet) {
    const candyShop = new CandyShopFake(wallet);

    return (
      <CancelModalDetail
        candyShop={candyShop}
        onCancel={() => console.log('CANCEL')}
        order={order}
        onChangeStep={(v) => console.log('change step', v)}
      />
    );
  } else {
    return <></>;
  }
};
