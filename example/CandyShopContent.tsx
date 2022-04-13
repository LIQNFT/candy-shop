import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { web3 } from "@project-serum/anchor";
import 'antd/dist/antd.min.css';
import React from 'react';
import { CandyShop, Orders, Stat, OrderDetail, Sell } from '../lib/';
import {
  CANDY_SHOP_PROGRAM_ID,
  CREATOR_ADDRESS,
  TREASURY_MINT,
} from './constant/publicKey';

export const CandyShopContent: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const env: web3.Cluster = 'devnet';

  const candyShop = new CandyShop(
    new web3.PublicKey(CREATOR_ADDRESS),
    new web3.PublicKey(TREASURY_MINT),
    new web3.PublicKey(CANDY_SHOP_PROGRAM_ID),
    env
  );

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <div style={{ textAlign: 'center', paddingBottom: 30 }}>
        <WalletMultiButton />
      </div>

      <div style={{ marginBottom: 50 }}>
        <Stat
          candyShop={candyShop}
          title={'Marketplace'}
          description={
            'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'
          }
        />
      </div>

      <div >
        <Orders
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={<WalletMultiButton />}
        />
      </div>

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Order Detail</h1>
      <OrderDetail
        tokenMint={'WfL9fAggBMHmjvBEu1v53fQkRmB3Cn4giJSSQxVSC5W'}
        backUrl={'/'}
        candyShop={candyShop}
        walletConnectComponent={<WalletMultiButton />}
        wallet={wallet}
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Sell</h1>
      <Sell
        connection={connection}
        wallet={wallet}
        candyShop={candyShop}
        walletConnectComponent={<WalletMultiButton />}
      />
    </div>
  );
};
