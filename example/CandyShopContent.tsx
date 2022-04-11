import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { web3 } from "@project-serum/anchor";
import 'antd/dist/antd.min.css';
import React from 'react';
import { CandyShop, Orders, Sell, Stat } from '../lib/.';
import {
  CANDY_SHOP_PROGRAM_ID,
  CREATOR_ADDRESS,
  TREASURY_MINT,
} from './constant/publicKey';

export const CandyShopContent: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const candyShop = new CandyShop(
    new web3.PublicKey(CREATOR_ADDRESS),
    new web3.PublicKey(TREASURY_MINT),
    new web3.PublicKey(CANDY_SHOP_PROGRAM_ID),
    'devnet',
    wallet!
  );

  return (
    <div style={{ paddingBottom: 50 }}>
      <div style={{ textAlign: 'center', paddingBottom: 30 }}>
        <WalletMultiButton />
      </div>

      <Stat
        style={{ marginBottom: 50 }}
        candyShop={candyShop}
        title={'Marketplace'}
        description={
          'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'
        }
      />

      <div style={{ marginBottom: 50 }}>
        <Orders
          walletPublicKey={wallet?.publicKey}
          candyShop={candyShop}
          walletConnectComponent={<WalletMultiButton />}
        />
      </div>

      <div>
        <h1 style={{ textAlign: 'center' }}>Sell Your NFTs</h1>
        <Sell
          connection={connection}
          walletPublicKey={wallet?.publicKey}
          candyShop={candyShop}
          walletConnectComponent={<WalletMultiButton />}
        />
      </div>
    </div>
  );
};
