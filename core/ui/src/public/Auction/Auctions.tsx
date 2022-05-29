import React, { useState, useEffect, useCallback } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionCard } from 'components/Auction';
import { Auction, AuctionStatus } from '@liqnft/candy-shop-types';
import { Empty } from 'components/Empty';
import { ORDER_FETCH_LIMIT } from 'constant/Orders';

const Logger = 'CandyShopUI/Auctions';

interface AuctionsProps {
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  candyShop: CandyShop;
}

export const Auctions: React.FC<AuctionsProps> = ({ walletConnectComponent, wallet, candyShop }) => {
  const [auctionedNfts, setAuctionedNfts] = useState<Auction[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  const walletKeyString = wallet?.publicKey.toString();

  const loadNextPage = (startIndex: number) => () => {
    if (startIndex === 0) return;
    fetchAuctions(startIndex);
  };

  const fetchAuctions = useCallback(
    (startIndex: number) => {
      setHasNextPage(true);
      setLoading(true);
      fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString(), {
        offset: startIndex,
        limit: ORDER_FETCH_LIMIT,
        status: [AuctionStatus.CREATED, AuctionStatus.STARTED, AuctionStatus.EXPIRED, AuctionStatus.COMPLETE],
        walletAddress: walletKeyString
      })
        .then((data: any) => {
          if (!data.result) {
            setHasNextPage(false);
            return;
          }
          const haveNextPage = data.offset + data.count < data.totalCount;
          setHasNextPage(haveNextPage);
          setStartIndex((prevIndex) => {
            if (startIndex === 0) {
              return 0 + ORDER_FETCH_LIMIT;
            }
            return prevIndex + ORDER_FETCH_LIMIT;
          });
          if (startIndex === 0) {
            setAuctionedNfts(data.result);
          } else {
            setAuctionedNfts((prevNfts) => [...prevNfts, ...data.result]);
          }
        })
        .catch((error: any) => {
          setHasNextPage(false);
          console.info(`${Logger}: fetchAuctionsByShopAddress failed, startIndex=${startIndex}, error= `, error);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [candyShop.candyShopAddress, walletKeyString]
  );

  useEffect(() => {
    fetchAuctions(0);
  }, [fetchAuctions]);

  return (
    <div className="candy-container">
      <InfiniteScroll
        dataLength={auctionedNfts.length}
        next={loadNextPage(startIndex)}
        hasMore={hasNextPage}
        loader={<LoadingSkeleton />}
      >
        {auctionedNfts.length === 0 && !loading ? (
          <Empty description="No auctions found" />
        ) : (
          <div className="candy-container-list">
            {auctionedNfts.map((auction: Auction) => (
              <AuctionCard
                key={auction.tokenAccount}
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
