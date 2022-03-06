import * as React from 'react';

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
  async buy() {

  }

  // TODO
  async sell() {

  }

  // TODO
  async cancel() {

  }

  // TODO
  async getStats() {

  }

  // TODO
  async getTransactions() {

  }
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
}

/**
 * React component for user to sell an NFT
 */
export const Sell = () => {
  return (
    <div>
      <button>Sell</button>
    </div>
  );
}

/**
 * React component that displays a list of orders
 */
export const OrderList = () => {
  return (
    <div style={{ maxWidth: 1600, margin: '0 auto'}}>
      <div style={{ width: '33%', float: 'left' }}>
        <div>
          <img src="https://via.placeholder.com/300" />
        </div>
        <div>
          NFT 1
        </div>
        <div>
          1 SOL
        </div>
      </div>
      <div style={{ width: '33%', float: 'left' }}>
        <div>
          <img src="https://via.placeholder.com/300" />
        </div>
        <div>
          NFT 2
        </div>
        <div>
          5 SOL
        </div>
      </div>
      <div style={{ width: '33%', float: 'left' }}>
        <div>
          <img src="https://via.placeholder.com/300" />
        </div>
        <div>
          NFT 3
        </div>
        <div>
          10 SOL
        </div>
      </div>
    </div>
  );
};

/**
 * React component that displays a single sell order
 */
export const OrderDetail = () => {
  return (
    <div style={{ maxWidth: 1600, margin: '0 auto'}}>
      OrderDetail
      <Buy />
    </div>
  );
}