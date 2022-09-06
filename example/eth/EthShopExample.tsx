import React from 'react';
import { Blockchain, EthCandyShop } from '../../core/sdk';

import { EthConnectionButton } from './ConnectionButton';
import { Orders, Stat, Sell } from '../../core/ui/.';
import { useEthConnection } from './context/connection';

interface EthShopExampleProps {
  candyShop: EthCandyShop | null;
}

export const EthShopExample: React.FC<EthShopExampleProps> = ({ candyShop }) => {
  const { publicKey } = useEthConnection();
  const wallet = publicKey ? { publicKey } : undefined;
  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <h1>Eth Candy Shop</h1>
      <EthConnectionButton />

      <Stat
        title={'Marketplace'}
        description={
          'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'
        }
        candyShop={candyShop as any}
      />

      <div style={{ padding: '15px' }} />
      {candyShop && (
        <Orders
          blockchain={Blockchain.Ethereum}
          candyShop={candyShop}
          wallet={wallet}
          walletConnectComponent={<EthConnectionButton />}
          filters
          filterSearch
          search
        />
      )}

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Sell</h1>

      {candyShop && (
        <Sell
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={<EthConnectionButton />}
          enableCacheNFT={true}
          blockchain={Blockchain.Ethereum}
        />
      )}
    </div>
  );
};
