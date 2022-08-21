import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop } from '../core/sdk/dist';
import { CreateDrop, Drops } from '../core/ui/.';

import 'antd/dist/antd.min.css';

interface DropExampleProps {
  candyShop: CandyShop;
}

export const DropExample: React.FC<DropExampleProps> = ({ candyShop }) => {
  const wallet = useAnchorWallet();

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <CreateDrop candyShop={candyShop} wallet={wallet} walletConnectComponent={<WalletMultiButton />} />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 30 }}>Public View</h1>
      <Drops wallet={wallet} candyShop={candyShop} walletConnectComponent={<WalletMultiButton />} filter search />
    </div>
  );
};
