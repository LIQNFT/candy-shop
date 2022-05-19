import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { CandyShop } from '../core/sdk/.';
import { Orders, Stat, OrderDetail, Sell, Activity, OrderDefaultFilter, Auction } from '../core/ui/.';

import { CANDY_SHOP_PROGRAM_ID, CREATOR_ADDRESS, TREASURY_MINT } from './constant/publicKey';

import 'antd/dist/antd.min.css';

interface AuctionExampleProps {
  network: web3.Cluster;
}

export const AuctionExample: React.FC<AuctionExampleProps> = ({ network }) => {
  const [treasuryMint] = useState(new web3.PublicKey(TREASURY_MINT));

  const wallet = useAnchorWallet();

  const candyShop = useMemo(() => {
    return new CandyShop(
      new web3.PublicKey(CREATOR_ADDRESS),
      treasuryMint,
      new web3.PublicKey(CANDY_SHOP_PROGRAM_ID),
      network,
      {
        mainnetConnectionUrl: 'https://ssc-dao.genesysgo.net/'
      }
    );
  }, [network, treasuryMint]);

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <div
        style={{
          padding: '10px 10px 50px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <Link style={{ paddingRight: 20 }} to="/">
            Marketplace Example
          </Link>
          <span style={{ paddingRight: 20, fontWeight: 'bold' }}>Auction Example</span>
        </div>
        <WalletMultiButton />
      </div>
      <Auction candyShop={candyShop} wallet={wallet} walletConnectComponent={<WalletMultiButton />} />
    </div>
  );
};
