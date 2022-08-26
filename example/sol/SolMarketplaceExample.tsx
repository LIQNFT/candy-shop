import React from 'react';

import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import { BlockchainType, CandyShop } from '../../core/sdk/.';
import { SortBy } from '../../core/types/.';
import { Activity, OrderDetail, Orders, Sell, Stat } from '../../core/ui/.';

import 'antd/dist/antd.min.css';
interface SolMarketplaceExampleProps {
  candyShop: CandyShop;
}

export const SolMarketplaceExample: React.FC<SolMarketplaceExampleProps> = ({ candyShop }) => {
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
          blockchain={BlockchainType.Solana}
        />
      </div>

      <Orders
        blockchain={BlockchainType.Solana}
        wallet={wallet}
        walletConnectComponent={<WalletMultiButton />}
        candyShop={candyShop}
        filters
        filterSearch
        search
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Order Detail</h1>
      <OrderDetail
        tokenMint={'91x1jpzwYAJCjBtXkR2ppuDSpjGr1iuTktCrgQVoUVBP'}
        backUrl={'/'}
        walletConnectComponent={<WalletMultiButton />}
        wallet={wallet}
        candyShop={candyShop}
        blockchain={BlockchainType.Solana}
      />

      {/* Can serve Activity with partial shop info without CandyShop instance to present the same */}
      {/* <OrderDetail
        tokenMint={'6WpKPqGYu2ZyRZ1upnmYkPAu2CTGVBE5QErzSUsPptyD'}
        backUrl={'/'}
        walletConnectComponent={<WalletMultiButton />}
        wallet={wallet}
        candyShop={{
          currencySymbol: candyShop.currencySymbol,
          currencyDecimals: candyShop.currencyDecimals,
          candyShopAddress: candyShop.candyShopAddress,
          priceDecimalsMin: candyShop.priceDecimalsMin,
          priceDecimals: candyShop.priceDecimals,
          connection: candyShop.connection,
          isEnterprise: candyShop.isEnterprise,
          baseUnitsPerCurrency: candyShop.baseUnitsPerCurrency,
          explorerLink: candyShop.explorerLink,
          env: candyShop.env
        }}
      /> */}

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Sell</h1>
      <Sell
        walletConnectComponent={<WalletMultiButton />}
        enableCacheNFT={true}
        blockchain={BlockchainType.Solana}
        wallet={wallet}
        candyShop={candyShop}
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', margin: '80px 0 30px' }}>Activity</h1>
      <Activity candyShop={candyShop} orderBy={ORDER_ACTIVITY} blockchain={BlockchainType.Solana} />
      {/* Can serve Activity with partial shop info without CandyShop instance to present the same */}
      {/* 
        <Activity candyShop={{
          candyShopAddress: candyShop.candyShopAddress,
          env: candyShop.env,
          baseUnitsPerCurrency: candyShop.baseUnitsPerCurrency,
          priceDecimalsMin: candyShop.priceDecimalsMin,
          priceDecimals: candyShop.priceDecimals,
          explorerLink: candyShop.explorerLink,
        }} orderBy={ORDER_ACTIVITY} />
      */}
    </div>
  );
};

const ORDER_ACTIVITY: SortBy[] = [
  { column: 'price', order: 'desc' },
  { column: 'nftName', order: 'asc' }
];
