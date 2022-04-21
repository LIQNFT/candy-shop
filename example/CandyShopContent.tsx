import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import { CandyShop } from '../core/sdk/.';
import { Orders, Stat, OrderDetail, Sell } from '../core/ui/.';
import {
  CANDY_SHOP_PROGRAM_ID,
  CREATOR_ADDRESS,
  TREASURY_MINT
} from './constant/publicKey';

export const CandyShopContent: React.FC = () => {
  const { connection } = useConnection();
  const [candyShop, setCandyShop] = useState<CandyShop>();
  const [treasuryMint] = useState(new web3.PublicKey(TREASURY_MINT));

  const wallet = useAnchorWallet();
  const env: web3.Cluster = 'devnet';

  useEffect(() => {
    if (!treasuryMint) return;
    setCandyShop(
      new CandyShop(
        new web3.PublicKey(CREATOR_ADDRESS),
        treasuryMint,
        new web3.PublicKey(CANDY_SHOP_PROGRAM_ID),
        env
      )
    );
  }, [treasuryMint]);

  if (!candyShop) return null;

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

      <div>
        <Orders
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={<WalletMultiButton />}
          filters={FILTERS}
        />
      </div>

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>
        Order Detail
      </h1>
      <OrderDetail
        tokenMint={'EVdLAk8GeWRsj2HpyBujG1pJPip5gjkPcZ76QinsHHtJ'}
        backUrl={'/'}
        candyShop={candyShop}
        walletConnectComponent={<WalletMultiButton />}
        wallet={wallet}
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>
        Sell
      </h1>
      <Sell
        connection={connection}
        wallet={wallet}
        candyShop={candyShop}
        walletConnectComponent={<WalletMultiButton />}
      />
    </div>
  );
};

const FILTERS = [
  { name: 'Puppies', identifier: 2036309415 },
  { name: 'Smilies', identifier: -38328789 },
  { name: 'Puppies + Smilies', identifier: [-38328789, 2036309415] }
];
