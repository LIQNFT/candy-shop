import React, { useMemo } from 'react';
import { EthSdkExample } from './EthSdkExample';
import { EthShopExample } from './EthMarketplace';
import { Route, Switch, Link, useLocation } from 'react-router-dom';
import { CandyShopDataValidator } from '../../core/ui/.';
import { EthCandyShop } from '../../core/sdk/.';
import { useEthConnection } from './context/connection';
import { Auction } from './Auction';
import { EthConnectionButton } from './ConnectionButton';
// import { ConfigureShop } from '../sol/ConfigureShop';

enum PageRoute {
  Shop = '/eth',
  SDK = '/eth/sdk',
  Auction = '/eth/auction'
}

const activeStyle = { pointerEvent: 'none', color: 'black', paddingRight: 20, fontWeight: 'bold' };
const normalStyle = { paddingRight: 20 };

export const EthExample: React.FC = () => {
  const { pathname } = useLocation();
  const { network } = useEthConnection();

  const candyShop = useMemo<EthCandyShop>(() => {
    let candyShop: any = null;
    try {
      candyShop = new EthCandyShop({
        candyShopCreatorAddress: '0x66AEe77371d992cdAacE956F5993094781997Bc0',
        treasuryMint: 'ETH',
        env: network
      });
    } catch (err) {
      console.log(`CandyShop: create instance failed, error=`, err);
    }
    return candyShop;
  }, []);

  const getStyle = (pageUrl: PageRoute) => {
    return pathname === pageUrl ? activeStyle : normalStyle;
  };

  return (
    <CandyShopDataValidator>
      <div
        style={{
          padding: '10px 10px 50px 20px',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Link style={getStyle(PageRoute.Shop)} to={PageRoute.Shop}>
              Marketplace
            </Link>
            <Link style={getStyle(PageRoute.Auction)} to={PageRoute.Auction}>
              Auction
            </Link>
            <Link style={getStyle(PageRoute.SDK)} to={PageRoute.SDK}>
              ETH SDK
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>Config Shop (WIP)</div>
            <EthConnectionButton />
          </div>
        </div>
        <Switch>
          <Route path={PageRoute.SDK} component={() => <EthSdkExample />} />
          <Route path={PageRoute.Auction} component={() => <Auction candyShop={candyShop} />} />
          <Route path={PageRoute.Shop} component={() => <EthShopExample candyShop={candyShop} />} />
        </Switch>
      </div>
    </CandyShopDataValidator>
  );
};
