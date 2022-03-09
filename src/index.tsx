import * as React from 'react';
import SellModal from './components/SellModal';

import './index.less';

/**
 * Core Candy Shop module
 */
export class CandyShop {
  private _storeId: string;

  constructor(storeId: string) {
    this._storeId = storeId;
  }

  // TODO
  async getOrders() {
    return this._storeId;
  }

  // TODO
  async buy() {}

  // TODO
  async sell() {}

  // TODO
  async cancel() {}

  // TODO
  async getStats() {}

  // TODO
  async getTransactions() {}
}

/**
 * React component for user to buy an NFT
 */
export const Buy = () => {
  return (
    <div>
      <button>Buy</button>
    </div>
  );
};

/**
 * React component that displays a single sell order
 */
export const OrderDetail = () => {
  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      OrderDetail
      <Buy />
    </div>
  );
};

export { default as OrderList } from './components/OrderList';
export { default as BuyModal } from './components/BuyModal';
export { default as SellModal } from './components/SellModal';

/**
 * React component for user to sell an NFT
 */
export const Sell = () => {
  const [isShow, setIsShow] = React.useState(false);

  return (
    <div>
      {isShow && <SellModal onCancel={() => setIsShow(false)} />}
      <button onClick={() => setIsShow(true)}>Sell modal</button>
    </div>
  );
};
