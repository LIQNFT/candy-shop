import React from 'react';

import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import { CandyShop } from '../core/sdk/.';
import { SortBy } from '../core/types';
import { Activity, OrderDetail, Orders, Sell, Stat } from '../core/ui/.';

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

      <Orders
        wallet={wallet}
        walletConnectComponent={<WalletMultiButton />}
        candyShop={candyShop}
        filters
        filterSearch
        search
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Order Detail</h1>
      <OrderDetail
        tokenMint={'Aj1k5FNSCkagdtEwjYzpKV47SGokioyCCy2XtqZ9t38G'}
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
      <Activity candyShop={candyShop} orderBy={ORDER_ACTIVITY} />
    </div>
  );
};

const ORDER_ACTIVITY: SortBy[] = [
  { column: 'price', order: 'desc' },
  { column: 'nftName', order: 'asc' }
];
