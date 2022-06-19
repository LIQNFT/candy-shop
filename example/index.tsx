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
import { CandyShopDataValidator, CandyShopPayProvider } from '../core/ui';
import { CandyShop } from '../core/sdk';
import { ConfigureShop } from './ConfigureShop';
import { DropExample } from './DropExample';

const disableStyle = { pointerEvent: 'none', color: 'black', paddingRight: 20, fontWeight: 'bold' };
const normalStyle = { paddingRight: 20 };

enum PageRoute {
  MarketPlace = '/',
  Auction = '/auction',
  EditionDrop = '/edition-drop'
}

const initiateRoutePage = () => {
  switch (window.location.pathname) {
    case PageRoute.Auction:
      return PageRoute.Auction;
    case PageRoute.EditionDrop:
      return PageRoute.EditionDrop;
    default:
      return PageRoute.MarketPlace;
  }
};

const App = () => {
  const [candyForm, setCandyForm] = useState(() => {
    const formLocalStorage = localStorage.getItem(LS_CANDY_FORM);
    if (formLocalStorage) {
      console.log('debugger: formLocalStorage=', JSON.parse(formLocalStorage));
      return JSON.parse(formLocalStorage);
    }
    return DEFAULT_FORM_CONFIG;
  });
  const [pageRoute, setPageRoute] = useState<PageRoute>(initiateRoutePage());

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
      candyShop = new CandyShop({
        candyShopCreatorAddress: new web3.PublicKey(candyForm.creatorAddress),
        treasuryMint: new web3.PublicKey(candyForm.treasuryMint),
        candyShopProgramId: new web3.PublicKey(candyForm.programId),
        env: candyForm.network,
        settings: JSON.parse(candyForm.settings),
        isEnterprise: false
      });
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
          <CandyShopPayProvider stripePublicKey={JSON.parse(candyForm.paymentProvider).stripePublicKey}>
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
                      style={pageRoute === PageRoute.MarketPlace ? disableStyle : normalStyle}
                      to={PageRoute.MarketPlace}
                      onClick={() => setPageRoute(PageRoute.MarketPlace)}
                    >
                      Marketplace
                    </Link>
                    <Link
                      style={pageRoute === PageRoute.Auction ? disableStyle : normalStyle}
                      to={PageRoute.Auction}
                      onClick={() => setPageRoute(PageRoute.Auction)}
                    >
                      Auction
                    </Link>
                    <Link
                      style={pageRoute === PageRoute.EditionDrop ? disableStyle : normalStyle}
                      to={PageRoute.EditionDrop}
                      onClick={() => setPageRoute(PageRoute.EditionDrop)}
                    >
                      Edition Drop
                    </Link>
                  </div>
                  <div>
                    <ConfigureShop setCandyForm={setCandyForm} candyForm={candyForm} />
                    <WalletMultiButton />
                  </div>
                </div>
                {candyShop ? (
                  <Switch>
                    <Route path="/edition-drop" component={() => <DropExample candyShop={candyShop} />} />
                    <Route path="/auction" component={() => <AuctionExample candyShop={candyShop} />} />
                    <Route path="/" component={() => <MarketplaceExample candyShop={candyShop} />} />
                  </Switch>
                ) : (
                  <div style={{ paddingTop: '30px', textAlign: 'center' }}>Error: Invalid shop configuration</div>
                )}
              </>
            </CandyShopDataValidator>
            </CandyShopPayProvider>
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
