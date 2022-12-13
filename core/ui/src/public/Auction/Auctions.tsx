import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionCard, AuctionModal } from 'components/Auction';
import { Auction, AuctionStatus, ListBase } from '@liqnft/candy-shop-types';
import { Empty } from 'components/Empty';
import { ORDER_FETCH_LIMIT } from 'constant/Orders';
import { DEFAULT_LIST_AUCTION_STATUS } from 'constant';
import { useUpdateCandyShopContext } from 'public/Context/CandyShopDataValidator';
import { EventName, useSocket } from 'public/Context/Socket';
import { removeDuplicate, removeListeners } from 'utils/helperFunc';
import { ShopProps } from '../../model';
import { SolStore, StoreProvider } from 'market';
import { handleError } from 'utils/ErrorHandler';

const Logger = 'CandyShopUI/Auctions';

interface AuctionsProps extends ShopProps {
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  statusFilters?: AuctionStatus[];
}

export const Auctions: React.FC<AuctionsProps> = ({
  walletConnectComponent,
  statusFilters = DEFAULT_LIST_AUCTION_STATUS,
  candyShop,
  wallet
}) => {
  const store = useMemo(() => StoreProvider({ candyShop, wallet }), [candyShop, wallet]);

  const [auctionSelected, setAuctionSelected] = useState<Auction>();
  const [auctionedNfts, setAuctions] = useState<Auction[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  const { onSocketEvent, onSendEvent } = useSocket();
  const walletKeyString = wallet?.publicKey?.toString();
  const candyShopAddress = candyShop.candyShopAddress.toString();

  useUpdateCandyShopContext({ candyShopAddress, network: candyShop.env as any });

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
          if (!data.result?.length) {
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
        .catch((error: Error) => {
          setHasNextPage(false);
          handleError(error);
          console.info(`${Logger}: fetchAuctionsByShopAddress failed, startIndex=${startIndex}, error= `, error);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [candyShopAddress, statusFilters, walletKeyString]
  );

  useEffect(() => {
    setAuctions([]);
  }, [statusFilters]);

  useEffect(() => {
    fetchAuctions(0);
  }, [fetchAuctions]);

  //socket
  useEffect(() => {
    const controllers = [
      onSocketEvent(EventName.auctionCreated, (auction: Auction) => {
        if (!statusFilters.includes(auction.status)) return;
        setAuctions((list) => removeDuplicate([auction], list, 'auctionAddress'));
      }),
      onSocketEvent(EventName.auctionUpdateStatus, (auction: { auctionAddress: string; status: AuctionStatus }) => {
        // status out of current Fe filter => remove it if exist
        if (!statusFilters.includes(auction.status)) {
          return setAuctions((list) => {
            const newList = list.filter((item) => item.auctionAddress !== auction.auctionAddress);
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
      })
    ];

    return () => removeListeners(controllers);
  }, [onSocketEvent, onSendEvent, statusFilters]);

  useEffect(() => {
    if (!walletKeyString) return;

    const controllers = [
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
  }, [onSendEvent, onSocketEvent, walletKeyString]);

  const buyNowAuction = useCallback(
    (auction: Auction) => {
      if (store instanceof SolStore) {
        return store.buyNowAuction(auction);
      }
      throw new Error(`Trader ${store.constructor.name} doesn't support buyNowAuction`);
    },
    [store]
  );

  const bidAuction = useCallback(
    (auction: Auction, price: number) => {
      if (store instanceof SolStore) {
        return store.bidAuction(auction, price);
      }
      throw new Error(`Trader ${store.constructor.name} doesn't support bidAuction`);
    },
    [store]
  );

  const withdrawAuctionBid = useCallback(
    (auction: Auction) => {
      if (store instanceof SolStore) {
        return store.withdrawAuctionBid(auction);
      }
      throw new Error(`Trader ${store.constructor.name} doesn't support withdrawAuctionBid`);
    },
    [store]
  );

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
          <>
            <div className="candy-container-list">
              {auctionedNfts.map((auction: Auction) => (
                <AuctionCard
                  key={auction.auctionAddress}
                  auction={auction}
                  walletConnectComponent={walletConnectComponent}
                  walletPublicKey={wallet?.publicKey?.toString()}
                  currencySymbol={candyShop.currencySymbol}
                  baseUnitsPerCurrency={candyShop.baseUnitsPerCurrency}
                  priceDecimalsMin={candyShop.priceDecimalsMin}
                  priceDecimals={candyShop.priceDecimals}
                  onClick={(auction) => {
                    setAuctionSelected(auction);
                  }}
                />
              ))}
            </div>
            {auctionSelected ? (
              <AuctionModal
                auction={auctionSelected}
                onClose={() => setAuctionSelected(undefined)}
                walletConnectComponent={walletConnectComponent}
                walletPublicKey={wallet?.publicKey?.toString()}
                candyShopEnv={candyShop.env}
                explorerLink={candyShop.explorerLink}
                buyNowAuction={buyNowAuction}
                bidAuction={bidAuction}
                withdrawAuctionBid={withdrawAuctionBid}
                currencySymbol={candyShop.currencySymbol}
                baseUnitsPerCurrency={candyShop.baseUnitsPerCurrency}
                priceDecimals={candyShop.priceDecimals}
                priceDecimalsMin={candyShop.priceDecimalsMin}
              />
            ) : null}
          </>
        )}
      </InfiniteScroll>
    </div>
  );
};
