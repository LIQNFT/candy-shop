import React, { memo, useMemo } from 'react';
import { EthCandyShop } from '../../core/sdk/.';
import { Orders, Stat, Sell, Activity, EthWallet } from '../../core/ui/.';
import { EthConnectButton } from './components/EthConnectButton';
import { useEthConnection } from './components/EthConnectionProvider';

interface EthMarketplaceExampleProps {
  candyShop: EthCandyShop;
}

export const EthMarketplaceExample: React.FC<EthMarketplaceExampleProps> = ({ candyShop }) => {
  const { address, web3Modal } = useEthConnection();

  const ethWallet = useMemo<EthWallet>(() => {
    return { publicKey: address, web3Modal };
  }, [address, web3Modal]);

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <Stat
        candyShop={candyShop}
        title={'Marketplace'}
        description={
          'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'
        }
      />

      <div style={{ padding: '15px' }} />
      <Orders
        candyShop={candyShop}
        wallet={ethWallet}
        walletConnectComponent={<EthConnectButton />}
        filters
        filterSearch
        search
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Sell</h1>
      <Sell wallet={ethWallet} candyShop={candyShop} walletConnectComponent={<EthConnectButton />} />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', margin: '80px 0 30px' }}>Activity</h1>
      <Activity candyShop={candyShop} />
    </div>
  );
};
