import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import React, { FC } from 'react';
import { CandyShop, Orders, Sell } from '../.';

export const CandyShopContent: FC = () => {
  const { connection } = useConnection();

  const wallet = useAnchorWallet();

  const candyShop = new CandyShop(
    new PublicKey("EzDnyZvt7XtB65DBpQELgtWPeDFae2u9JvAQTkWq9pb7"),
    new PublicKey("BSPpKnfVMbnDfQKgJzUTQHVa78YY8FYqv8ttMwAG7sZn"),
    new PublicKey("FmDt3mTCWsF4xCGteZNQihqbjEdCqNcGPqg9NRJWkgxq"),
    "devnet",
    wallet!
  );

  return (
    <div style={{paddingBottom: 30}}>
      <div style={{textAlign: 'center', paddingBottom: 30}}>
        <WalletMultiButton />
      </div>
      <div style={{marginBottom: 50}}>
        <h1 style={{textAlign: 'center'}}>Candy Shop</h1>
        <Orders
          connection={connection}
          walletPublicKey={wallet?.publicKey}
          candyShop={candyShop}
          walletConnectComponent={<WalletMultiButton />}
        />
      </div>
      <div style={{marginBottom: 50}}>
        <h1 style={{textAlign: 'center'}}>Sell Your NFTs</h1>
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