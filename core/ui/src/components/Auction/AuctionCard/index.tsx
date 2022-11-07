import React, { useState, useEffect } from 'react';
import { Auction, AuctionStatus } from '@liqnft/candy-shop-types';
import { Countdown } from 'components/Countdown';
import { Price } from 'components/Price';
import { Card } from 'components/Card';

interface AuctionCardProps {
  auction: Auction;
  walletConnectComponent: React.ReactElement;
  walletPublicKey: string | undefined;
  currencySymbol: string;
  baseUnitsPerCurrency: number;
  priceDecimalsMin: number;
  priceDecimals: number;
  onClick: (auction: Auction) => void;
}

interface LastBidInfo {
  price: string | undefined;
  title: string;
}

interface statusTagInfo {
  tagName: string;
  styleName: string;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  walletPublicKey,
  baseUnitsPerCurrency,
  currencySymbol,
  priceDecimals,
  priceDecimalsMin,
  onClick
}) => {
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
      if (auction.highestBidBuyer && auction.highestBidBuyer === walletPublicKey) {
        setStatusTag({ tagName: 'HIGHEST BID', styleName: 'candy-status-tag' });
      } else if (auction.userBid && auction.highestBidBuyer !== walletPublicKey) {
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
  }, [auction, walletPublicKey]);

  const handleClick = () => {
    onClick?.(auction);
  };

  return (
    <div>
      <Card
        onClick={handleClick}
        key={auction.auctionAddress}
        name={auction.name}
        ticker={auction.symbol}
        imgUrl={auction.image || ''}
        label={statusTag && <div className={`${statusTag.styleName}`}>{statusTag.tagName}</div>}
        footer={
          <div className="candy-card-footer">
            <div className="candy-card-stat">
              {lastBid?.title}:{' '}
              <Price
                value={lastBid?.price}
                currencySymbol={currencySymbol}
                baseUnitsPerCurrency={baseUnitsPerCurrency}
                priceDecimalsMin={priceDecimalsMin}
                priceDecimals={priceDecimals}
              />
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
    </div>
  );
};
