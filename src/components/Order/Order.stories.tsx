import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { Order } from './index';
import {
  Order as OrderSchema,
  Side,
  Status,
} from 'solana-candy-shop-schema/dist';
import { CandyShopFake } from 'stories/mocks';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

export default {
  title: 'Order',
  component: Order,
} as ComponentMeta<typeof Order>;

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
  const wallet = useAnchorWallet();
  if (wallet) {
    const candyShop = new CandyShopFake(wallet);

    return (
      <Order
        candyShop={candyShop}
        walletPublicKey={wallet?.publicKey}
        order={order}
        walletConnectComponent={<div>Button</div>}
      />
    );
  } else {
    return <></>;
  }
};
