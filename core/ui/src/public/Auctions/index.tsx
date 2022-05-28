import React, { useState, useEffect } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionCard } from 'components/Auction';
import { Auction, AuctionStatus } from '@liqnft/candy-shop-types';
import { Empty } from 'components/Empty';
import { ORDER_FETCH_LIMIT } from 'constant/Orders';

interface AuctionsProps {
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  candyShop: CandyShop;
}

export const Auctions: React.FC<AuctionsProps> = ({ walletConnectComponent, wallet, candyShop }) => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  const walletKeyString = wallet?.publicKey.toString();

  const loadNextPage = (startIndex: number) => () => {
    if (startIndex === 0) return;

    setHasNextPage(true);
    setLoading(true);

    fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString(), {
      offset: startIndex,
      limit: ORDER_FETCH_LIMIT,
      status: [AuctionStatus.CREATED, AuctionStatus.STARTED, AuctionStatus.EXPIRED, AuctionStatus.COMPLETE],
      walletAddress: wallet?.publicKey.toString()
    })
      .then((data: any) => {
        if (!data.result) {
          setHasNextPage(false);
          return;
        }
        const haveNextPage = data.offset + data.count < data.totalCount;
        setHasNextPage(haveNextPage);
        setStartIndex((prevIndex) => prevIndex + ORDER_FETCH_LIMIT);
        setNfts((prevNfts) => [...prevNfts, ...data.result]);
      })
      .catch((error: any) => {
        setHasNextPage(false);
        console.info('fetchAuctionsByShopAddress failed: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log({ candyShop });

    setHasNextPage(true);
    setLoading(true);

    fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString(), {
      offset: 0,
      limit: ORDER_FETCH_LIMIT,
      status: [AuctionStatus.CREATED, AuctionStatus.STARTED, AuctionStatus.EXPIRED, AuctionStatus.COMPLETE],
      walletAddress: wallet?.publicKey.toString()
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
        setHasNextPage(false);
        console.log('fetchAuctionsByShopAddress failed: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [candyShop, wallet?.publicKey]);

  return (
    <div className="candy-container">
      <InfiniteScroll
        dataLength={nfts.length}
        next={loadNextPage(startIndex)}
        hasMore={hasNextPage}
        loader={<LoadingSkeleton />}
      >
        {nfts.length === 0 && !loading ? (
          <Empty description="No auctions found" />
        ) : (
          <div className="candy-container-list">
            {nfts.map((auction: Auction) => (
              <AuctionCard
                auction={auction}
                candyShop={candyShop}
                wallet={wallet}
                walletConnectComponent={walletConnectComponent}
              />
            ))}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};
