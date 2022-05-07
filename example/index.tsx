import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'react-app-polyfill/ie11';
import { WalletModalProvider } from '@solana/wallet-adapter-ant-design';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  getTorusWallet
} from '@solana/wallet-adapter-wallets';
import { web3 } from '@project-serum/anchor';
import { MarketplaceExample } from './MarketplaceExample';
import { AuctionExample } from './AuctionExample';
import { TORUS_WALLET_CLIENT_ID } from './constant/clientId';
import { CandyShopDataValidator } from '../core/ui';
import { getParameterByName } from './utils';

const App = () => {
  // mainnet-beta: localhost:1234?network=mainnet-beta
  const network = getParameterByName('network') || WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => web3.clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getTorusWallet({
        options: {
          clientId: TORUS_WALLET_CLIENT_ID
        }
      }),
      getLedgerWallet(),
      getSolongWallet(),
      getMathWallet(),
      getSolletWallet()
    ],
    []
  );

  return (
    <BrowserRouter>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <CandyShopDataValidator>
              <Switch>
                <Route path="/auction" component={() => <AuctionExample network={network} />} />
                <Route path="/" component={() => <MarketplaceExample network={network} />} />
              </Switch>
            </CandyShopDataValidator>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
