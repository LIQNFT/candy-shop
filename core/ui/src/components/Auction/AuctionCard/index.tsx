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

interface LastBidInfo {
  price: string | undefined;
  title: string;
}

interface statusTagInfo {
  tagName: string;
  styleName: string;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, candyShop, wallet, walletConnectComponent }) => {
  const [selected, setSelected] = useState<any>();
  const [lastBid, setLastBid] = useState<LastBidInfo>();
  const [statusTag, setStatusTag] = useState<statusTagInfo>({ tagName: '', styleName: '' });

  useEffect(() => {
    if (auction.status === AuctionStatus.CREATED) {
      setLastBid({ price: auction.startingBid, title: 'Starting bid' });
      setStatusTag({ tagName: 'NOT STARTED', styleName: 'candy-status-tag candy-status-tag-gray' });
    } else if (auction.status === AuctionStatus.STARTED) {
      if (auction.highestBidPrice) {
        setLastBid({ price: auction.highestBidPrice, title: 'Current bid' });
      } else {
        setLastBid({ price: auction.startingBid, title: 'Starting bid' });
      }
      if (auction.highestBidBuyer && auction.highestBidBuyer === wallet?.publicKey.toString()) {
        setStatusTag({ tagName: 'HIGHEST BID', styleName: 'candy-status-tag' });
      } else if (auction.userBid && wallet && auction.highestBidBuyer !== wallet.publicKey.toString()) {
        setStatusTag({ tagName: 'OUTBID', styleName: 'candy-status-tag candy-status-tag-yellow' });
      }
    } else if (
      auction.status === AuctionStatus.COMPLETE ||
      auction.status === AuctionStatus.CANCELLED ||
      auction.status === AuctionStatus.EXPIRED
    ) {
      setLastBid({ price: auction.highestBidPrice, title: 'Winning bid' });
      setStatusTag({ tagName: 'ENDED', styleName: 'candy-status-tag candy-status-tag-gray' });
    }
  }, [auction, wallet]);

  return (
    <div>
      <Card
        onClick={() => setSelected(true)}
        key={auction.auctionAddress}
        name={auction.name}
        ticker={auction.symbol}
        imgUrl={auction.image || ''}
        label={statusTag && <div className={`${statusTag.styleName}`}>{statusTag.tagName}</div>}
        footer={
          <div className="candy-card-footer">
            <div className="candy-card-stat">
              {lastBid?.title}: <Price value={lastBid?.price} candyShop={candyShop} />
            </div>
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
