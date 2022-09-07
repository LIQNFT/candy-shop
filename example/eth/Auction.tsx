import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';

import { Blockchain, EthCandyShop } from '../../core/sdk/.';
import { CreateAuction, Auctions, AuctionActivity } from '../../core/ui/.';
import { AuctionStatus, SortBy } from '../../core/types/.';

import 'antd/dist/antd.min.css';
import { useEthConnection } from './context/connection';

interface AuctionExampleProps {
  candyShop: EthCandyShop;
}

export const Auction: React.FC<AuctionExampleProps> = ({ candyShop }) => {
  const { publicKey } = useEthConnection();
  const wallet = publicKey ? { publicKey } : undefined;

  const onCreatedAuctionSuccessCallback = (auctionedToken: any) => {
    console.log('Auction: onCreatedAuction, token=', auctionedToken);
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
        onCreatedAuctionSuccess={onCreatedAuctionSuccessCallback}
        cacheUserNFT={true}
        blockchain={Blockchain.Ethereum}
      />

      <h1 style={{ marginTop: 40, marginBottom: 40 }}>Auctions</h1>
      <Auctions
        candyShop={candyShop}
        wallet={wallet}
        walletConnectComponent={<WalletMultiButton />}
        statusFilters={AUCTION_FILTER}
        blockchain={Blockchain.Ethereum}
      />

      {/* <h1 style={{ marginTop: 40, marginBottom: 40 }}>Auction Activities</h1>
      <AuctionActivity
        candyShop={candyShop as any}
        auctionAddress="91cr87Pib1ue3obYrZnDmzsa4KAok6UvRFi2F2c6LxQa"
        orderBy={AUCTION_ORDER}
      /> */}
    </div>
  );
};

const AUCTION_FILTER = [AuctionStatus.CREATED, AuctionStatus.STARTED, AuctionStatus.EXPIRED, AuctionStatus.COMPLETE];
