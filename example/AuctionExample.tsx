import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { CandyShop } from '../core/sdk/.';
import { CreateAuction, Auctions } from '../core/ui/.';

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
      new web3.PublicKey('HCF8y8wjrUQUBuD2kF7Np24UaaQTHoicUYSWidW1t1bw'),
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
      <CreateAuction candyShop={candyShop} wallet={wallet} walletConnectComponent={<WalletMultiButton />} />

      <h1 style={{ marginTop: 40, marginBottom: 40 }}>Auctions</h1>
      <Auctions candyShop={candyShop} wallet={wallet} walletConnectComponent={<WalletMultiButton />} />
    </div>
  );
};
