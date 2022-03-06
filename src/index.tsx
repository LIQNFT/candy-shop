import * as React from 'react';

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

export const Sell = () => {
  return (
    <div>
      <button>Sell</button>
    </div>
  );
}