import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import { CandyShop, SingleTokenInfo } from '../../core/sdk/.';
import { CreateAuction, Auctions, AuctionActivity } from '../../core/ui/.';
import { AuctionStatus, SortBy } from '../../core/types/.';

import 'antd/dist/antd.min.css';

interface SolAuctionExampleProps {
  candyShop: CandyShop;
}

export const SolAuctionExample: React.FC<SolAuctionExampleProps> = ({ candyShop }) => {
  const wallet = useAnchorWallet();

  const onCreatedAuctionSuccessCallback = (auctionedToken: SingleTokenInfo) => {
    console.log('SolAuctionExample: onCreatedAuction, token=', auctionedToken);
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
      <Auctions
        candyShop={candyShop}
        wallet={wallet}
        walletConnectComponent={<WalletMultiButton />}
        statusFilters={AUCTION_FILTER}
      />

      <h1 style={{ marginTop: 40, marginBottom: 40 }}>Auction Activities</h1>
      <AuctionActivity
        candyShop={candyShop}
        auctionAddress="91cr87Pib1ue3obYrZnDmzsa4KAok6UvRFi2F2c6LxQa"
        orderBy={AUCTION_ORDER}
      />
      {/* Can serve AuctionActivity with partial shop info without CandyShop instance to present the same */}
      {/* <AuctionActivity
        candyShop={{
          env: candyShop.env,
          explorerLink: candyShop.explorerLink,
          baseUnitsPerCurrency: candyShop.baseUnitsPerCurrency,
          priceDecimalsMin: candyShop.priceDecimalsMin,
          priceDecimals: candyShop.priceDecimals,
          currencySymbol: candyShop.currencySymbol,
        }}
        auctionAddress="91cr87Pib1ue3obYrZnDmzsa4KAok6UvRFi2F2c6LxQa"
        orderBy={AUCTION_ORDER}
      /> */}
    </div>
  );
};

const AUCTION_ORDER: SortBy = { column: 'price', order: 'desc' };

const AUCTION_FILTER = [AuctionStatus.CREATED, AuctionStatus.STARTED, AuctionStatus.EXPIRED, AuctionStatus.COMPLETE];
