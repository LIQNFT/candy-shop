import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import React, { FC, useMemo } from 'react';
// import '../dist/candy-shop-antd.css';
import { CandyShop, Orders, Sell, Stat } from '../.';

export const CandyShopContent: FC = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const candyShop = useMemo(
    () =>
      new CandyShop(
        new PublicKey('Fo2cXie4UwreZi7LHMpnsyVPvzuo4FMwAVbSUYQsmbsh'),
        new PublicKey('So11111111111111111111111111111111111111112'),
        new PublicKey('8yRJB65ZT6pKFBWQkkN4WBdGzFtKmdvJNJcByMa6faBr'),
        'devnet',
        wallet!
      ),
    [wallet]
  );

  return (
    <div>
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

      <div style={{ marginBottom: 50 }}>
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
