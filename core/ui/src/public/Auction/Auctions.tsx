import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Blockchain, CandyShop, EthCandyShop, fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionCard } from 'components/Auction';
import { Auction, AuctionStatus, ListBase, ShopStatusType } from '@liqnft/candy-shop-types';
import { Empty } from 'components/Empty';
import { ORDER_FETCH_LIMIT, BACKGROUND_UPDATE_LIMIT } from 'constant/Orders';
import { AuctionActionsStatus, DEFAULT_LIST_AUCTION_STATUS } from 'constant';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateSubject } from 'public/Context/CandyShopDataValidator';
import { CommonChain, EthWallet } from '../../model';

const Logger = 'CandyShopUI/Auctions';

interface AuctionsType<C, S, W> extends CommonChain<C, S, W> {
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  statusFilters?: AuctionStatus[];
}
type AuctionsProps =
  | AuctionsType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | AuctionsType<Blockchain.Solana, CandyShop, AnchorWallet>;

export const Auctions: React.FC<AuctionsProps> = ({
  walletConnectComponent,
  statusFilters = DEFAULT_LIST_AUCTION_STATUS,
  ...chainProps
}) => {
  const [auctionedNfts, setAuctionedNfts] = useState<Auction[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  useUpdateSubject({ subject: ShopStatusType.Auction, candyShopAddress: chainProps.candyShop.candyShopAddress });
  const updateStatus = useValidateStatus(AuctionActionsStatus);
  const updateStatusRef = useRef<number>(updateStatus);

  const walletKeyString = chainProps.wallet?.publicKey.toString();

  const loadNextPage = (startIndex: number) => () => {
    if (startIndex === 0) return;
    fetchAuctions(startIndex);
  };

  const fetchAuctions = useCallback(
    (startIndex: number) => {
      setHasNextPage(true);
      setLoading(true);
      fetchAuctionsByShopAddress(chainProps.candyShop.candyShopAddress.toString(), {
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
    [chainProps.candyShop.candyShopAddress, statusFilters, walletKeyString]
  );

  useEffect(() => {
    if (updateStatus === updateStatusRef.current) return;
    updateStatusRef.current = updateStatus;

    const batches = Array.from({ length: Math.ceil(startIndex / BACKGROUND_UPDATE_LIMIT) });
    Promise.all(
      batches.map((_, idx) =>
        fetchAuctionsByShopAddress(chainProps.candyShop.candyShopAddress.toString(), {
          offset: idx * BACKGROUND_UPDATE_LIMIT,
          limit: BACKGROUND_UPDATE_LIMIT,
          status: statusFilters,
          walletAddress: walletKeyString
        })
      )
    )
      .then((responses: ListBase<Auction>[]) => {
        const memo: { [key: string]: true } = {};

        setAuctionedNfts(
          responses.reduce((acc: Auction[], res: ListBase<Auction>) => {
            if (!res.result?.length) return acc;
            res.result.forEach((auction) => {
              if (memo[auction.tokenAccount]) return;
              memo[auction.tokenAccount] = true;
              acc.push(auction);
            });
            return acc;
          }, [])
        );
        setStartIndex(batches.length * BACKGROUND_UPDATE_LIMIT);
      })
      .catch((err: any) => {
        console.log(`${Logger} BackgroundUpdate failed, error=`, err);
      });
  }, [chainProps.candyShop.candyShopAddress, startIndex, statusFilters, updateStatus, walletKeyString]);

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
                walletConnectComponent={walletConnectComponent}
                {...chainProps}
              />
            ))}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};
