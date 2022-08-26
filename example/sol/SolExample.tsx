import React, { useMemo, useState } from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
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
import { SolMarketplaceExample } from './SolMarketplaceExample';
import { SolAuctionExample } from './SolAuctionExample';
import { TORUS_WALLET_CLIENT_ID } from './constants/clientId';
import { DEFAULT_FORM_CONFIG, LS_CANDY_FORM } from './constants/formConfig';
import { CandyShopDataValidator } from '../../core/ui/.';
import { CandyShop } from '../../core/sdk/.';
import { ShopConfig } from './ShopConfig';
import { SolDropExample } from './SolDropExample';

const activeStyle = { pointerEvent: 'none', paddingRight: 20, color: 'black', fontWeight: 'bold' };
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

export const SolExample: React.FC = () => {
  const [candyForm, setCandyForm] = useState(() => {
    const formLocalStorage = localStorage.getItem(LS_CANDY_FORM);
    if (formLocalStorage) return JSON.parse(formLocalStorage);
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
                  <span style={{ fontWeight: 'bold', fontSize: 16, marginRight: 20 }}>Solana Candy Shop</span>
                  <Link
                    style={pageRoute === PageRoute.MarketPlace ? activeStyle : normalStyle}
                    to={PageRoute.MarketPlace}
                    onClick={() => setPageRoute(PageRoute.MarketPlace)}
                  >
                    Marketplace
                  </Link>
                  <Link
                    style={pageRoute === PageRoute.Auction ? activeStyle : normalStyle}
                    to={PageRoute.Auction}
                    onClick={() => setPageRoute(PageRoute.Auction)}
                  >
                    Auction
                  </Link>
                  <Link
                    style={pageRoute === PageRoute.EditionDrop ? activeStyle : normalStyle}
                    to={PageRoute.EditionDrop}
                    onClick={() => setPageRoute(PageRoute.EditionDrop)}
                  >
                    Edition Drop
                  </Link>
                </div>
                <div>
                  <Link style={activeStyle} to="/">
                    SOL
                  </Link>
                  <Link style={normalStyle} to="/eth">
                    ETH / MATIC
                  </Link>
                  <ShopConfig setCandyForm={setCandyForm} candyForm={candyForm} />
                  <WalletMultiButton />
                </div>
              </div>
              {candyShop ? (
                <Switch>
                  <Route path="/edition-drop" component={() => <SolDropExample candyShop={candyShop} />} />
                  <Route path="/auction" component={() => <SolAuctionExample candyShop={candyShop} />} />
                  <Route path="/" component={() => <SolMarketplaceExample candyShop={candyShop} />} />
                </Switch>
              ) : (
                <div style={{ paddingTop: '30px', textAlign: 'center' }}>Error: Invalid shop configuration</div>
              )}
            </>
          </CandyShopDataValidator>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
