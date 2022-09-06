import React, { useState, useEffect } from 'react';
import { Blockchain, CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
import { Auction, AuctionStatus } from '@liqnft/candy-shop-types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { AuctionModal } from '../AuctionModal';
import { Countdown } from 'components/Countdown';
import { Price } from 'components/Price';
import { Card } from 'components/Card';
import { CommonChain, EthWallet } from 'model';

interface AuctionCardType<C, S, W> extends CommonChain<C, S, W> {
  auction: Auction;
  walletConnectComponent: React.ReactElement;
}

type AuctionCardProps =
  | AuctionCardType<Blockchain.Solana, CandyShop, AnchorWallet>
  | AuctionCardType<Blockchain.Ethereum, EthCandyShop, EthWallet>;

interface LastBidInfo {
  price: string | undefined;
  title: string;
}

interface statusTagInfo {
  tagName: string;
  styleName: string;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, walletConnectComponent, ...chainProps }) => {
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
      if (auction.highestBidBuyer && auction.highestBidBuyer === chainProps.wallet?.publicKey.toString()) {
        setStatusTag({ tagName: 'HIGHEST BID', styleName: 'candy-status-tag' });
      } else if (
        auction.userBid &&
        chainProps.wallet &&
        auction.highestBidBuyer !== chainProps.wallet.publicKey.toString()
      ) {
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
  }, [auction, chainProps.wallet]);

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
              {lastBid?.title}: <Price value={lastBid?.price} {...chainProps} />
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
      {selected && chainProps.candyShop ? (
        <AuctionModal
          auction={auction}
          onClose={() => setSelected(false)}
          walletConnectComponent={walletConnectComponent}
          {...chainProps}
        />
      ) : null}
    </div>
  );
};
