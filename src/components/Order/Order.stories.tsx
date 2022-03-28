import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { Order } from './index';
import {
  Order as OrderSchema,
  Side,
  Status,
} from 'solana-candy-shop-schema/dist';

export default {
  title: 'Order',
  component: Order,
} as ComponentMeta<typeof Order>;

class CandyShopFake {
  stats() {
    return Promise.resolve({
      floorPrice: 10_000_000,
      totalListed: 4,
      totalVolume: 10_000_000,
    });
  }
}

const order: OrderSchema = {
  side: Side.BUY,
  ticker: 'string',
  name: 'string',
  price: '1000',
  amount: '1',
  edition: 0,
  tokenAccount: 'asdasd asdasd',
  metadata: 'asdasd',
  tokenMint: 'string',
  nftDescription: 'string',
  nftUri: 'https://via.placeholder.com/728x90.png',
  nftImageLink: 'https://via.placeholder.com/728x90.png',
  nftAnimationLink: 'string',
  tradeState: 'string',
  status: Status.OPEN,
  walletAddress: 'string',
  txHash: 'string',
};
export const Primary = (): JSX.Element => {
  const candyShop = new CandyShopFake();

  return (
    <Order
      candyShop={candyShop}
      order={order}
      walletConnectComponent={<div>Button</div>}
    />
  );
};
