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
import React, { useMemo } from 'react';
import 'react-app-polyfill/ie11';
import ReactDOM from 'react-dom';
import { CandyShopContent } from './CandyShopContent';
import { TORUS_WALLET_CLIENT_ID } from './constant/clientId';
import { CandyShopDataValidator } from '../core/ui';

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' ')) as web3.Cluster;
}

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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CandyShopDataValidator>
            <CandyShopContent network={network} />
          </CandyShopDataValidator>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
