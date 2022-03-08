import React, { FC, useMemo } from 'react';
import { Orders, Sell } from '../.';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';

export const CandyShopContent: FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  console.log('Connection', connection);
  console.log('Wallet', publicKey);

  return (
    <div style={{paddingBottom: 30}}>
      <div style={{textAlign: 'center', paddingBottom: 30}}>
        <WalletMultiButton />
      </div>
      <div style={{marginBottom: 50}}>
        <h1 style={{textAlign: 'center'}}>Orders</h1>
        <Orders
          storeId={'5wbadqR2UBmV8AUBKxAE64z5ASBorsUofoHQWhJSVYpZ'}
          connection={connection}
          walletPublicKey={publicKey}
          walletConnectComponent={<WalletMultiButton />}
        />
      </div>
      <div style={{marginBottom: 50}}>
        <h1 style={{textAlign: 'center'}}>Sell</h1>
        <Sell
          storeId={'5wbadqR2UBmV8AUBKxAE64z5ASBorsUofoHQWhJSVYpZ'}
          connection={connection}
          walletPublicKey={publicKey}
          walletConnectComponent={<WalletMultiButton />}
        />
      </div>
    </div>
  );
};