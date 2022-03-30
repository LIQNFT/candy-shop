import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import React, { FC, useMemo } from 'react';
import { CandyShop, Orders, Sell, Stat } from '../.';

export const CandyShopContent: FC = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const candyShop = useMemo(
    () =>
      new CandyShop(
        new PublicKey('Fo2cXie4UwreZi7LHMpnsyVPvzuo4FMwAVbSUYQsmbsh'),
        new PublicKey('So11111111111111111111111111111111111111112'),
        new PublicKey('csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN'),
        'devnet',
        wallet!
      ),
    [wallet]
  );

  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{ textAlign: 'center', paddingBottom: 30 }}>
        <WalletMultiButton />
      </div>

      <Stat
        candyShop={candyShop}
        title={'Marketplace'}
        description={'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'}
        style={{ paddingBottom: 50 }}
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
