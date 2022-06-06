import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import 'react-app-polyfill/ie11';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-ant-design';
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
import { DEFAULT_FORM_CONFIG, LS_CANDY_FORM } from './constant/formConfiguration';
import { CandyShopDataValidator } from '../core/ui';
import { CandyShop } from '../core/sdk';
import { ConfigureShop } from './ConfigureShop';
import { DEFAULT_CANDY_FORM, LS_CANDY_FORM } from './constant';

const disableStyle = { pointerEvent: 'none', color: 'black', paddingRight: 20, fontWeight: 'bold' };
const normalStyle = { paddingRight: 20 };

enum Page {
  MarketPlace,
  Auction
}

const App = () => {
  const [candyForm, setCandyForm] = useState(() => {
    const formLocalStorage = localStorage.getItem(LS_CANDY_FORM);
    if (formLocalStorage) return JSON.parse(formLocalStorage);
    return DEFAULT_FORM_CONFIG;
  });
  const [page, setPage] = useState<Page>(window.location.pathname === '/auction' ? Page.Auction : Page.MarketPlace);

  const endpoint = useMemo(() => web3.clusterApiUrl(candyForm.network), [candyForm.network]);
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

  const candyShop = useMemo(() => {
    let candyShop: any = null;
    try {
      candyShop = new CandyShop(
        new web3.PublicKey(candyForm.creatorAddress),
        new web3.PublicKey(candyForm.treasuryMint),
        new web3.PublicKey(candyForm.programId),
        candyForm.network,
        JSON.parse(candyForm.settings)
      );
    } catch (err) {
      console.log(`CandyShop: create instance failed, error=`, err);
    }

    return candyShop;
  }, [candyForm]);

  return (
    <BrowserRouter>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <CandyShopDataValidator>
              <>
                <div
                  style={{
                    padding: '10px 10px 50px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <Link
                      style={page === Page.Auction ? normalStyle : disableStyle}
                      to="/"
                      onClick={() => setPage(Page.MarketPlace)}
                    >
                      Marketplace Example
                    </Link>
                    <Link
                      style={page === Page.Auction ? disableStyle : normalStyle}
                      to="/auction"
                      onClick={() => setPage(Page.Auction)}
                    >
                      Auction Example
                    </Link>
                  </div>
                  <div>
                    <ConfigureShop setCandyForm={setCandyForm} candyForm={candyForm} />
                    <WalletMultiButton />
                  </div>
                </div>
                {candyShop ? (
                  <Switch>
                    <Route path="/auction" component={() => <AuctionExample candyShop={candyShop} />} />
                    <Route path="/" component={() => <MarketplaceExample candyShop={candyShop} />} />
                  </Switch>
                ) : (
                  <div style={{ paddingTop: '30px', textAlign: 'center' }}>Error: Invalid shop configuration</div>
                )}
              </>
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
