import React, { useMemo, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { CandyShop } from '../core/sdk/.';
import { Orders, Stat, OrderDetail, Sell, Activity, OrderDefaultFilter } from '../core/ui/.';
import { CANDY_SHOP_PROGRAM_ID, CREATOR_ADDRESS, TREASURY_MINT } from './constant/publicKey';

import 'antd/dist/antd.min.css';

interface CandyShopContentProps {
  network: web3.Cluster;
}

export const CandyShopContent: React.FC<CandyShopContentProps> = ({ network }) => {
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
      <div style={{ textAlign: 'center', paddingBottom: 30 }}>
        <WalletMultiButton />
      </div>

      <div style={{ marginBottom: 50 }}>
        <Stat
          title={'Marketplace'}
          description={
            'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'
          }
          candyShop={candyShop}
        />
      </div>

      <div>
        <Orders
          wallet={wallet}
          walletConnectComponent={<WalletMultiButton />}
          candyShop={candyShop}
          filters={FILTERS}
        />
      </div>

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Order Detail</h1>
      <OrderDetail
        tokenMint={'CKon3nX3K3xFAzrp44kxW3RCvMTAU4ChcTswxaYt1BWU'}
        backUrl={'/'}
        walletConnectComponent={<WalletMultiButton />}
        wallet={wallet}
        candyShop={candyShop}
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Sell</h1>
      <Sell wallet={wallet} candyShop={candyShop} walletConnectComponent={<WalletMultiButton />} />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', margin: '80px 0 30px' }}>Activity</h1>
      <Activity candyShop={candyShop} />
    </div>
  );
};

const FILTERS = [
  { name: 'Puppies', identifier: 2036309415 },
  { name: 'Shibas', identifier: 1235887132 },
  { name: 'Puppies + Shibas', identifier: [1235887132, 2036309415] },
  { name: 'Purple Puppies', identifier: 2036309415, attribute: { backgrounds: 'gradient_purple' } }
];
