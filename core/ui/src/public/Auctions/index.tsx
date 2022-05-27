import React, { useState, useEffect } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';

import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from 'components/Skeleton';
import { Card } from 'components/Card';
import { AuctionModal } from 'components/AuctionModal';
import { Auction, AuctionStatus } from '@liqnft/candy-shop-types';
import { Empty } from 'components/Empty';
import dayjs from 'dayjs';
import { ORDER_FETCH_LIMIT } from 'constant/Orders';

interface AuctionsProps {
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  candyShop: CandyShop;
}

const getPrice = (candyShop: CandyShop, price?: string | null) => {
  if (!price || isNaN(Number(price))) return null;

  return (Number(price) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

export const Auctions: React.FC<AuctionsProps> = ({ walletConnectComponent, wallet, candyShop }) => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>();
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [startIndex, setStartIndex] = useState(0);

  const loadNextPage = (startIndex: number) => () => {
    if (startIndex === 0) return;

    fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString(), {
      offset: startIndex,
      limit: ORDER_FETCH_LIMIT,
      status: [AuctionStatus.CREATED, AuctionStatus.EXPIRED, AuctionStatus.STARTED]
    })
      .then((data: any) => {
        if (!data.result) {
          setHasNextPage(false);
          return;
        }
        if (data.offset + data.count >= data.totalCount) {
          setHasNextPage(false);
        } else {
          setHasNextPage(true);
        }
        setStartIndex((prevIndex) => prevIndex + ORDER_FETCH_LIMIT);
        setNfts((prevNfts) => [...prevNfts, ...data.result]);
      })
      .catch((error: any) => {
        console.info('fetchAuctionsByShopAddress failed: ', error);
      });
  };

  const onCloseModal = () => {
    setSelected(false);
  };

  useEffect(() => {
    fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString(), {
      offset: 0,
      limit: ORDER_FETCH_LIMIT,
      status: [AuctionStatus.CREATED, AuctionStatus.EXPIRED, AuctionStatus.STARTED]
    })
      .then((data: any) => {
        if (!data.result) {
          setHasNextPage(false);
          return;
        }
        const haveNextPage = data.offset + data.count < data.totalCount;
        setHasNextPage(haveNextPage);
        setStartIndex(() => 0 + ORDER_FETCH_LIMIT);
        setNfts(data.result);
      })
      .catch((error: any) => {
        console.log('fetchAuctionsByShopAddress failed: ', error);
      });
  }, [candyShop]);

  return (
    <div className="candy-container">
      <InfiniteScroll
        dataLength={nfts.length}
        next={loadNextPage(startIndex)}
        hasMore={hasNextPage}
        loader={
          <div className="candy-container-list">
            {Array(4)
              .fill(0)
              .map((_, key) => (
                <div key={key}>
                  <Skeleton />
                </div>
              ))}
          </div>
        }
      >
        {nfts.length === 0 ? (
          <Empty description="No auctions found" />
        ) : (
          <div className="candy-container-list">
            {nfts.map((order: Auction) => {
              const highestBidPrice =
                getPrice(candyShop, order.highestBidPrice) || getPrice(candyShop, order.startingBid);
              const highestBidPriceContent = highestBidPrice ? `${highestBidPrice} ${candyShop.currencySymbol}` : 'N/A';
              const second = Math.floor(Number(order.startTime) + Number(order.biddingPeriod) - dayjs().unix());
              const countdown = dayjs().add(second, 'second').unix();

              const getRetainCountdown: any = () => {
                const countdownElement = document.querySelector(`#x${order.auctionAddress}`);
                if (!countdownElement) {
                  return setTimeout(getRetainCountdown, 1000);
                }

                const NOW = dayjs().unix();
                const t = countdown - NOW;

                if (t <= 0) {
                  countdownElement.textContent = `Ended: ${dayjs
                    .unix(Number(order.startTime) + Number(order.biddingPeriod))
                    .format('MM/DD/YYYY')}`;
                  return;
                }

                const hours = Math.floor(t / 3600);
                const minutes = Math.floor((t - hours * 3600) / 60);
                const seconds = t - hours * 3600 - minutes * 60;

                const hoursString = `0${hours}`.slice(-2);
                const minutesString = `0${minutes}`.slice(-2);
                const secondsString = `0${seconds}`.slice(-2);

                countdownElement.textContent = `Ends In: ${hoursString}:${minutesString}:${secondsString}`;

                setTimeout(getRetainCountdown, 1000);
              };
              getRetainCountdown();

              return (
                <Card
                  onClick={() => setSelected(order)}
                  key={order.auctionAddress}
                  name={order.name}
                  ticker={order.symbol}
                  imgUrl={order.image || ''}
                  label={
                    second <= 0 ? (
                      <div className="candy-status-tag candy-status-tag-gray-1">ENDED</div>
                    ) : order.highestBidBuyer === wallet?.publicKey.toString() ? (
                      <div className="candy-status-tag">HIGHEST BID</div>
                    ) : (
                      <div className="candy-status-tag candy-status-tag-yellow">OUTBID</div>
                    )
                  }
                  footer={
                    <div className="candy-card-footer">
                      <div className="candy-card-stat">Current Bid: {highestBidPriceContent}</div>
                      <div className="candy-card-stat" id={'x' + order.auctionAddress}>
                        Ended: 05/25/2022
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </InfiniteScroll>

      {selected ? (
        <AuctionModal
          order={selected}
          onClose={onCloseModal}
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={walletConnectComponent}
        />
      ) : null}
    </div>
  );
};
