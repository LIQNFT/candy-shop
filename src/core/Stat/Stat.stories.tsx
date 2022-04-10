import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { Stat } from './index';
import { CandyShopFake } from 'stories/mocks';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

export default {
  title: 'Stat',
  component: Stat,
} as ComponentMeta<typeof Stat>;

export const Primary = (): JSX.Element => {
  const wallet = useAnchorWallet();
  if (wallet) {
    const candyShop = new CandyShopFake(wallet);

    return (
      <>
        <Stat
          candyShop={candyShop}
          title="Marketplace"
          description="Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!"
          style={{ paddingBottom: 50 }}
        />
      </>
    );
  } else {
    return <></>;
  }
};
