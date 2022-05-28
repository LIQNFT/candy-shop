import React, { useState, useEffect } from 'react';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Auction, AuctionStatus } from '@liqnft/candy-shop-types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { AuctionModal } from '../AuctionModal';
import { Countdown } from 'components/Countdown';
import { Price } from 'components/Price';
import { Card } from 'components/Card';

interface AuctionCardProps {
  auction: Auction;
  candyShop: CandyShop;
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, candyShop, wallet, walletConnectComponent }) => {
  const [selected, setSelected] = useState<any>();

  let statusTag: React.ReactElement = <></>;
  if (auction.status === AuctionStatus.CREATED) {
    statusTag = <div className="candy-status-tag candy-status-tag-gray">NOT STARTED</div>;
  } else if (auction.status === AuctionStatus.STARTED) {
    if (auction.highestBidBuyer && auction.highestBidBuyer === wallet?.publicKey.toString()) {
      statusTag = <div className="candy-status-tag">HIGHEST BID</div>;
    } else if (auction.userBid && wallet && auction.highestBidBuyer !== wallet.publicKey.toString()) {
      statusTag = <div className="candy-status-tag candy-status-tag-yellow">OUTBID</div>;
    }
  } else if (
    auction.status === AuctionStatus.COMPLETE ||
    auction.status === AuctionStatus.CANCELLED ||
    auction.status === AuctionStatus.EXPIRED
  ) {
    statusTag = <div className="candy-status-tag candy-status-tag-gray">ENDED</div>;
  }

  let lastBid: React.ReactElement = <></>;
  if (auction.status === AuctionStatus.STARTED) {
    if (auction.highestBidPrice) {
      lastBid = (
        <>
          Current bid: <Price value={auction.highestBidPrice} candyShop={candyShop} />
        </>
      );
    } else {
      lastBid = (
        <>
          Starting bid: <Price value={auction.startingBid} candyShop={candyShop} />
        </>
      );
    }
  } else if (auction.status === AuctionStatus.CREATED) {
    lastBid = (
      <>
        Starting bid: <Price value={auction.startingBid} candyShop={candyShop} />
      </>
    );
  } else {
    lastBid = (
      <>
        Winning bid: <Price value={auction.highestBidPrice} candyShop={candyShop} />
      </>
    );
  }

  return (
    <div>
      <Card
        onClick={() => setSelected(true)}
        key={auction.auctionAddress}
        name={auction.name}
        ticker={auction.symbol}
        imgUrl={auction.image || ''}
        label={statusTag}
        footer={
          <div className="candy-card-footer">
            <div className="candy-card-stat">{lastBid}</div>
            <div className="candy-card-stat">
              <Countdown
                start={Number(auction.startTime)}
                end={Number(auction.startTime) + Number(auction.biddingPeriod)}
                status={auction.status}
              />
            </div>
          </div>
        }
      />
      {selected && candyShop ? (
        <AuctionModal
          auction={auction}
          onClose={() => {
            setSelected(false);
          }}
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={walletConnectComponent}
        />
      ) : null}
    </div>
  );
};
