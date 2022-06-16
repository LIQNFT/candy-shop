import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionCard } from 'components/Auction';
import { Auction, AuctionStatus, ListBase, ShopStatusType } from '@liqnft/candy-shop-types';
import { Empty } from 'components/Empty';
import { ORDER_FETCH_LIMIT, BACKGROUND_UPDATE_LIMIT } from 'constant/Orders';
import { AuctionActionsStatus } from 'constant';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateSubject } from 'public/Context';

const Logger = 'CandyShopUI/Auctions';

interface AuctionsProps {
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  candyShop: CandyShop;
}

const LIST_AUCTION_STATUS = [
  AuctionStatus.CREATED,
  AuctionStatus.STARTED,
  AuctionStatus.EXPIRED,
  AuctionStatus.COMPLETE
];

export const Auctions: React.FC<AuctionsProps> = ({ walletConnectComponent, wallet, candyShop }) => {
  const [auctionedNfts, setAuctionedNfts] = useState<Auction[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  useUpdateSubject(ShopStatusType.Auction, candyShop.candyShopAddress);
  const updateStatus = useValidateStatus(AuctionActionsStatus);
  const updateStatusRef = useRef<number>(updateStatus);

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
        status: LIST_AUCTION_STATUS,
        walletAddress: walletKeyString
      })
        .then((data: ListBase<Auction>) => {
          if (!data.success || !data.result?.length) {
            setHasNextPage(false);
            return;
          }
          const haveNextPage = data.offset + data.count < data.totalCount;
          setHasNextPage(haveNextPage);
          setStartIndex((prevIndex) => {
            if (startIndex === 0) return 0 + ORDER_FETCH_LIMIT;
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
    if (updateStatus === updateStatusRef.current) return;
    updateStatusRef.current = updateStatus;

    const batches = Array.from({ length: Math.ceil(startIndex / BACKGROUND_UPDATE_LIMIT) });
    Promise.all(
      batches.map((_, idx) =>
        fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString(), {
          offset: idx * BACKGROUND_UPDATE_LIMIT,
          limit: BACKGROUND_UPDATE_LIMIT,
          status: LIST_AUCTION_STATUS,
          walletAddress: walletKeyString
        })
      )
    )
      .then((responses: ListBase<Auction>[]) => {
        const memo: { [key: string]: true } = {};
        const newList = responses.reduce((acc: Auction[], res: ListBase<Auction>) => {
          if (!res.result?.length) return acc;
          res.result.forEach((auction) => {
            if (memo[auction.tokenAccount]) return;
            memo[auction.tokenAccount] = true;
            acc.push(auction);
          });
          return acc;
        }, []);

        setAuctionedNfts((list: Auction[]) => {
          list.forEach((auction: Auction) => {
            if (memo[auction.tokenAccount]) return;
            newList.push(auction);
          });
          return newList;
        });
        setStartIndex(batches.length * BACKGROUND_UPDATE_LIMIT);
      })
      .catch((err: any) => {
        console.log(`${Logger} BackgroundUpdate failed, error=`, err);
      });
  }, [candyShop.candyShopAddress, startIndex, updateStatus, walletKeyString]);

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
