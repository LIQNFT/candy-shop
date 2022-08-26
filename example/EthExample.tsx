import React from 'react';
import { EthSdkExample } from './eth/EthSdkExample';
import { EthShopExample } from './eth/EthShopExample';
import { Route, Switch, Link, useLocation } from 'react-router-dom';

enum PageRoute {
  Shop = '/eth',
  SDK = '/eth/sdk'
}

const disableStyle = { pointerEvent: 'none', color: 'black', paddingRight: 20, fontWeight: 'bold' };
const normalStyle = { paddingRight: 20 };

export const EthExample: React.FC = () => {
  const { pathname } = useLocation();

  return (
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
        <Route path={PageRoute.Shop} component={() => <EthShopExample />} />
      </Switch>
    </div>
  );
};
