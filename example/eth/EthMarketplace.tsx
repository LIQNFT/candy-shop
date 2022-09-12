import React from 'react';
import { Blockchain, EthCandyShop } from '../../core/sdk/dist';

import { EthConnectionButton } from './ConnectionButton';
import { Orders, Stat, Sell, Activity } from '../../core/ui/.';
import { useEthConnection } from './context/connection';

interface EthShopExampleProps {
  candyShop: EthCandyShop;
}

export const EthShopExample: React.FC<EthShopExampleProps> = ({ candyShop }) => {
  const { publicKey } = useEthConnection();
  const wallet = publicKey ? { publicKey } : undefined;
  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      {/* <h1>Eth Candy Shop</h1>
      <EthConnectionButton /> */}

      <Stat
        candyShop={candyShop}
        blockchain={Blockchain.Ethereum}
        title={'Marketplace'}
        description={
          'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'
        }
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
          blockchain={Blockchain.Ethereum}
        />
      )}

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', margin: '80px 0 30px' }}>Activity</h1>
      {candyShop && <Activity candyShop={candyShop} blockchain={Blockchain.Ethereum} />}
    </div>
  );
};
