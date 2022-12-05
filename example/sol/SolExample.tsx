import React, { useCallback, useMemo, useState } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
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
import { CandyShopDataValidator } from '../../core/ui/.';
import { CandyShop } from '../../core/sdk/.';
import { ShopConfig } from './ShopConfig';
import { SolDropExample } from './SolDropExample';
import { Cluster } from '@solana/web3.js';

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
  const [pageRoute, setPageRoute] = useState<PageRoute>(initiateRoutePage());
  const [candyShop, setCandyShop] = useState<CandyShop | null>();

  const endpoint = useMemo(() => web3.clusterApiUrl((candyShop?.env || 'devnet') as Cluster), [candyShop?.env]);
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

  const onSetCandyShop = useCallback((candyShop: CandyShop) => setCandyShop(candyShop), []);

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
                  <ShopConfig onSetCandyShop={onSetCandyShop} />
                  <WalletMultiButton />
                </div>
              </div>
              {candyShop === undefined ? (
                <div style={{ textAlign: 'center' }}>Loading...</div>
              ) : candyShop === null ? (
                <div style={{ paddingTop: '30px', textAlign: 'center' }}>Error: Invalid shop configuration</div>
              ) : (
                <Switch>
                  <Route path="/edition-drop" render={() => <SolDropExample candyShop={candyShop} />} />
                  <Route path="/auction" render={() => <SolAuctionExample candyShop={candyShop} />} />
                  <Route path="/" render={() => <SolMarketplaceExample candyShop={candyShop} />} />
                </Switch>
              )}
            </>
          </CandyShopDataValidator>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
