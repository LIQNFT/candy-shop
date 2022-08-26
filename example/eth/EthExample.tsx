import React, { useEffect, useState } from 'react';
import { EthMarketplaceExample } from './EthMarketplaceExample';
import { Route, Switch, Link, useLocation } from 'react-router-dom';
import { CandyShopDataValidator } from '../../core/ui/.';
import { EthCandyShop, getEthCandyShop } from '../../core/sdk/.';
import { EthConnectButton } from './components/EthConnectButton';
import { EthConnectionProvider } from './components/EthConnectionProvider';
import { ShopConfig } from './ShopConfig';
import { ETH_DEFAULT_FORM_CONFIG, ETH_LS_CANDY_FORM } from './constants/formConfig';

enum PageRoute {
  Marketplace = '/eth'
}

const activeStyle = { pointerEvent: 'none', color: 'black', paddingRight: 20, fontWeight: 'bold' };
const normalStyle = { paddingRight: 20 };

export const EthExample: React.FC = () => {
  const [candyForm, setCandyForm] = useState(() => {
    const formLocalStorage = localStorage.getItem(ETH_LS_CANDY_FORM);
    if (formLocalStorage) return JSON.parse(formLocalStorage);
    return ETH_DEFAULT_FORM_CONFIG;
  });
  const [candyShop, setCandyShop] = useState<EthCandyShop>();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!candyForm.creatorAddress) return;

    const params = {
      candyShopCreatorAddress: candyForm.creatorAddress,
      treasuryMint: candyForm.treasuryMint,
      programId: candyForm.programId,
      env: candyForm.network,
      settings: JSON.parse(candyForm.settings)
    };

    getEthCandyShop(params)
      .then((candyShop) => {
        console.log(candyShop);

        if (candyShop === undefined) {
          setCandyShop(undefined);
        } else {
          setCandyShop(candyShop);
        }
      })
      .catch((error: Error) => {
        setCandyShop(undefined);
        console.log('getEthCandyShop failed, error=', error);
      });
  }, [candyForm]);

  const getStyle = (pageUrl: PageRoute) => {
    return pathname === pageUrl ? activeStyle : normalStyle;
  };

  return (
    <EthConnectionProvider defaultNetwork={candyForm.network}>
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
              <span style={{ fontWeight: 'bold', fontSize: 16, marginRight: 20 }}>Ethereum / Polygon Candy Shop</span>
              <Link style={getStyle(PageRoute.Marketplace)} to={PageRoute.Marketplace}>
                Marketplace
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link style={normalStyle} to="/">
                SOL
              </Link>
              <Link style={activeStyle} to="/eth">
                ETH / MATIC
              </Link>
              <ShopConfig setCandyForm={setCandyForm} candyForm={candyForm} />
              <EthConnectButton />
            </div>
          </div>

          {candyShop === undefined ? (
            <div style={{ textAlign: 'center' }}>Loading...</div>
          ) : candyShop === null ? (
            <div style={{ textAlign: 'center' }}>Invalid Candy Shop</div>
          ) : (
            <Switch>
              <Route path={PageRoute.Marketplace}>
                <EthMarketplaceExample candyShop={candyShop} />
              </Route>
            </Switch>
          )}
        </>
      </CandyShopDataValidator>
    </EthConnectionProvider>
  );
};
