import React, { useState, useEffect, useCallback } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionCard } from 'components/Auction';
import { Auction, AuctionStatus, ListBase } from '@liqnft/candy-shop-types';
import { Empty } from 'components/Empty';
import { ORDER_FETCH_LIMIT } from 'constant/Orders';
import { DEFAULT_LIST_AUCTION_STATUS } from 'constant';
import { useUpdateCandyShopContext } from 'public/Context/CandyShopDataValidator';
import { EventName, useSocket } from 'public/Context/Socket';
import { removeDuplicate, removeListeners } from 'utils/helperFunc';

const Logger = 'CandyShopUI/Auctions';

interface AuctionsProps {
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  candyShop: CandyShop;
  statusFilters?: AuctionStatus[];
}

export const Auctions: React.FC<AuctionsProps> = ({
  walletConnectComponent,
  wallet,
  candyShop,
  statusFilters = DEFAULT_LIST_AUCTION_STATUS
}) => {
  const [auctionedNfts, setAuctions] = useState<Auction[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  const { onSocketEvent, onSendEvent } = useSocket();
  const walletKeyString = wallet?.publicKey.toString();
  const candyShopAddress = candyShop.candyShopAddress;

  useUpdateCandyShopContext({ candyShopAddress, network: candyShop.env });

  const loadNextPage = (startIndex: number) => () => {
    if (startIndex === 0) return;
    fetchAuctions(startIndex);
  };

  const fetchAuctions = useCallback(
    (startIndex: number) => {
      setHasNextPage(true);
      setLoading(true);
      fetchAuctionsByShopAddress(candyShopAddress, {
        offset: startIndex,
        limit: ORDER_FETCH_LIMIT,
        status: statusFilters,
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
            setAuctions(data.result);
          } else {
            setAuctions((prevNfts) => [...prevNfts, ...data.result]);
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
    [candyShopAddress, statusFilters, walletKeyString]
  );

  useEffect(() => {
    fetchAuctions(0);
  }, [fetchAuctions]);

  //socket
  useEffect(() => {
    if (!walletKeyString) return;

    const controllers = [
      onSocketEvent(EventName.auctionCreated, (auction: Auction) => {
        if (!statusFilters.includes(auction.status)) return;
        setAuctions((list) => removeDuplicate([auction], list, 'auctionAddress'));
      }),
      onSocketEvent(EventName.auctionUpdateStatus, (auction: { auctionAddress: string; status: AuctionStatus }) => {
        // status out of current Fe filter => remove it if exist
        if (!statusFilters.includes(auction.status)) {
          return setAuctions((list) => {
            const newList = list.filter((item) => item.auctionAddress === auction.auctionAddress);
            if (newList.length === list.length) return list;
            return newList;
          });
        } else {
          // find and update status for that auction
          setAuctions((list) =>
            list.map((item) => {
              if (item.auctionAddress === auction.auctionAddress) {
                return { ...item, status: auction.status };
              }
              return item;
            })
          );
        }
      }),
      onSocketEvent(EventName.auctionUpdateBid, (data: { auctionAddress: string }) => {
        // find current auction in list:
        setAuctions((list) => {
          const currentOne = list.find((item) => item.auctionAddress === data.auctionAddress);
          if (currentOne && walletKeyString) {
            onSendEvent(EventName.getAuctionByAddressAndWallet, {
              auctionAddress: data.auctionAddress,
              walletAddress: walletKeyString
            });
          }
          return list;
        });
      }),
      onSocketEvent(EventName.getAuctionByAddressAndWallet, (data: Auction) => {
        setAuctions((list) => list.map((item) => (item.auctionAddress === data.auctionAddress ? data : item)));
      })
    ];

    return () => removeListeners(controllers);
  }, [onSocketEvent, onSendEvent, statusFilters, walletKeyString]);

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
