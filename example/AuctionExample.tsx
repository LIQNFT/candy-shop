import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { CandyShop, SingleTokenInfo } from '../core/sdk/.';
import { CreateAuction, Auctions } from '../core/ui/.';
import { getParameterByName } from './utils';

import { CANDY_SHOP_PROGRAM_ID, TREASURY_MINT } from './constant/publicKey';

import 'antd/dist/antd.min.css';

interface AuctionExampleProps {
  network: web3.Cluster;
}

export const AuctionExample: React.FC<AuctionExampleProps> = ({ network }) => {
  const creatorAddress = getParameterByName('creatorAddress') || '58ux56s2RhfNJKKtBa2zQAqKWou6xp5qKrTxQZRNkscB';

  const [treasuryMint] = useState(new web3.PublicKey(TREASURY_MINT));

  const wallet = useAnchorWallet();

  const candyShop = useMemo(() => {
    return new CandyShop(
      new web3.PublicKey(creatorAddress),
      treasuryMint,
      new web3.PublicKey(CANDY_SHOP_PROGRAM_ID),
      network,
      {
        mainnetConnectionUrl: 'https://ssc-dao.genesysgo.net/'
      }
    );
  }, [network, treasuryMint]);

  const onCreatedAuctionSuccessCallback = (auctionedToken: SingleTokenInfo) => {
    console.log('AuctionExample: onCreatedAuction, token=', auctionedToken);
  };

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
      <p style={{ fontSize: 16, color: 'red', fontWeight: 'bold', maxWidth: 1000, margin: '0px auto 30px' }}>
        Note: Auctions are now available on devnet, feel free to try it out and give us feedback. We aim to launch on
        mainnet in mid June. To create an auction on your Candy Shop, you may use the URL
        /auction?creatorAddress=[yourWalletAddress]
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
