import React, { useMemo } from 'react';
import { EthCandyShop } from '../core/sdk';

export const EthExample: React.FC = () => {
  const candyShop = useMemo(() => {
    let candyShop: any = null;
    try {
      candyShop = new EthCandyShop({
        candyShopCreatorAddress: 'TestShop',
        treasuryMint: 'ETH',
        env: 'goerli'
      });
    } catch (err) {
      console.log(`CandyShop: create instance failed, error=`, err);
    }

    return candyShop;
  });

  console.log(candyShop);

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <h1>Eth Candy Shop</h1>
    </div>
  );
};
