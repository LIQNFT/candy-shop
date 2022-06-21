import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import { CandyShop, SingleTokenInfo } from '../core/sdk/.';
import { CreateAuction, Auctions } from '../core/ui/.';

import 'antd/dist/antd.min.css';

interface AuctionExampleProps {
  candyShop: CandyShop;
}

export const AuctionExample: React.FC<AuctionExampleProps> = ({ candyShop }) => {
  const wallet = useAnchorWallet();

  const onCreatedAuctionSuccessCallback = (auctionedToken: SingleTokenInfo) => {
    console.log('AuctionExample: onCreatedAuction, token=', auctionedToken);
  };

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <p style={{ fontSize: 16, fontWeight: 'bold', maxWidth: 1000, margin: '0px auto 30px' }}>
        Note: To create an auction in your shop, click the Config button on the top right and enter your creator address
      </p>
      <CreateAuction
        candyShop={candyShop}
        wallet={wallet}
        walletConnectComponent={<WalletMultiButton />}
        onCreatedAuctionSuccess={(token: SingleTokenInfo) => onCreatedAuctionSuccessCallback(token)}
        cacheUserNFT={true}
      />

      <h1 style={{ marginTop: 40, marginBottom: 40 }}>Auctions</h1>
      <Auctions candyShop={candyShop} wallet={wallet} walletConnectComponent={<WalletMultiButton />} />
    </div>
  );
};
