import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { Stat } from './index';

export default {
  title: 'Stat',
  component: Stat,
} as ComponentMeta<typeof Stat>;

class CandyShopFake {
  stats() {
    return Promise.resolve({
      floorPrice: 10_000_000,
      totalListed: 4,
      totalVolume: 10_000_000,
    });
  }
}

export const Primary = (): JSX.Element => {
  const candyShop = new CandyShopFake();

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
};
