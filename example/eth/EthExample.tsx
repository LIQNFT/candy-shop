import React, { useMemo } from 'react';
import { EthSdkExample } from './EthSdkExample';
import { EthShopExample } from './EthShopExample';
import { Route, Switch, Link, useLocation } from 'react-router-dom';
import { CandyShopDataValidator } from '../../core/ui/.';
import { EthCandyShop } from '../../core/sdk/.';
import { useEthConnection } from './context/connection';
import { Auction } from './Auction';

enum PageRoute {
  Shop = '/eth',
  SDK = '/eth/sdk',
  Auction = '/eth/auction'
}

const disableStyle = { pointerEvent: 'none', color: 'black', paddingRight: 20, fontWeight: 'bold' };
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

    console.log(candyShop);

    return candyShop;
  }, []);

  return (
    <CandyShopDataValidator>
      <div
        style={{
          padding: '10px 10px 50px 20px',
          alignItems: 'center'
        }}
      >
        <div>
          <Link style={pathname === PageRoute.Shop ? disableStyle : normalStyle} to={PageRoute.Shop}>
            ETH Shop
          </Link>
          <Link style={pathname === PageRoute.SDK ? disableStyle : normalStyle} to={PageRoute.SDK}>
            ETH SDK
          </Link>
        </div>
        <Switch>
          <Route path={PageRoute.SDK} component={() => <EthSdkExample />} />
          <Route path={PageRoute.Shop} component={() => <EthShopExample candyShop={candyShop} />} />
          <Route path={PageRoute.Auction} component={() => <Auction candyShop={candyShop} />} />
        </Switch>
      </div>
    </CandyShopDataValidator>
  );
};
