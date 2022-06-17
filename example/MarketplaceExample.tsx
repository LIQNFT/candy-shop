import React from 'react';

import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Orders, Stat, OrderDetail, Sell, Activity } from '@liqnft/candy-shop';

import 'antd/dist/antd.min.css';
interface MarketplaceExampleProps {
  candyShop: CandyShop;
}

export const MarketplaceExample: React.FC<MarketplaceExampleProps> = ({ candyShop }) => {
  const wallet = useAnchorWallet();

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <div style={{ marginBottom: 50 }}>
        <Stat
          title={'Marketplace'}
          description={
            'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'
          }
          candyShop={candyShop}
        />
      </div>

      <Orders wallet={wallet} walletConnectComponent={<WalletMultiButton />} candyShop={candyShop} filters={FILTERS} />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Order Detail</h1>
      <OrderDetail
        tokenMint={'CKon3nX3K3xFAzrp44kxW3RCvMTAU4ChcTswxaYt1BWU'}
        backUrl={'/'}
        walletConnectComponent={<WalletMultiButton />}
        wallet={wallet}
        candyShop={candyShop}
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Sell</h1>
      <Sell
        wallet={wallet}
        candyShop={candyShop}
        walletConnectComponent={<WalletMultiButton />}
        enableCacheNFT={true}
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', margin: '80px 0 30px' }}>Activity</h1>
      <Activity candyShop={candyShop} />
    </div>
  );
};

const FILTERS = [
  { name: 'Puppies', collectionId: '1', identifier: 2036309415 },
  { name: 'Shibas', collectionId: '2', identifier: 1235887132 },
  { name: 'Puppies + Shibas', collectionId: '3', identifier: [1235887132, 2036309415] },
  {
    name: 'Purple Puppies',
    collectionId: '4',
    identifier: 2036309415,
    attribute: [{ backgrounds: 'gradient_purple' }]
  },
  {
    name: 'White eye',
    collectionId: '5',
    attribute: [{ Shine: 'Shapes' }, { Eyeball: 'White' }]
  }
];
