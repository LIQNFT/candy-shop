import React, { useState, useCallback, useEffect } from 'react';

import { ExplorerLink } from 'components/ExplorerLink';
import { Processing } from 'components/Processing';
import InfiniteScroll from 'react-infinite-scroll-component';

import { CandyShop, fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';
import { Auction, AuctionStatus, ListBase, ShopStatusType, SortBy } from '@liqnft/candy-shop-types';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateSubject } from 'public/Context';
import { ActivityActionsStatus, DEFAULT_LIST_AUCTION_STATUS } from 'constant';
import { removeDuplicate } from 'utils/array';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import './style.less';
import { AnchorWallet } from '@solana/wallet-adapter-react';

interface AuctionActivityProps {
  candyShop: CandyShop;
  orderBy?: SortBy[] | SortBy;
  statusFilters?: AuctionStatus[];
  wallet?: AnchorWallet;
}

const LIMIT = 10;
const DO_NOTHING_FUNC = () => {
  // this prevent double call api transaction in useEffect and infinity lib
};

const Logger = 'CandyShopUI/AuctionActivity';

export const AuctionActivity: React.FC<AuctionActivityProps> = ({
  candyShop,
  // orderBy,
  statusFilters = DEFAULT_LIST_AUCTION_STATUS,
  wallet
}) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);

  console.log({ auctions });

  useUpdateSubject(ShopStatusType.Auction);
  const updateActivityStatus = useValidateStatus(ActivityActionsStatus);

  const walletAddress = wallet?.publicKey.toString();

  const getAuctions = useCallback(
    (offset: number, limit: number, firstLoad?: boolean) => () => {
      if (!walletAddress) return;
      fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString(), {
        offset,
        limit,
        status: statusFilters,
        walletAddress
      })
        .then((res: ListBase<Auction>) => {
          const { result, offset, totalCount, count, success } = res;
          if (!success) {
            return setHasMore(false);
          }
          const hasMore = offset + count < Number(totalCount);
          if (hasMore) {
            setOffset(offset + count + 1);
          }

          setHasMore(hasMore);
          setAuctions((list) => {
            if (firstLoad) return result || [];
            return removeDuplicate<Auction>(list, result, 'auctionAddress');
          });
        })
        .catch((error: any) => {
          console.log(`${Logger}: fetchAuctionsByShopAddress failed, error=`, error);
        });
    },
    [candyShop.candyShopAddress, statusFilters, walletAddress]
  );

  useEffect(() => {
    getAuctions(0, LIMIT)();
  }, [getAuctions]);

  //update hook
  useEffect(() => {
    if (!updateActivityStatus || !walletAddress) return;

    fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString(), {
      offset: 0,
      limit: offset + LIMIT,
      walletAddress,
      status: statusFilters
    })
      .then((res: ListBase<Auction>) => {
        if (!res.success) return;
        setAuctions(res.result);
      })
      .catch((error: any) => {
        console.log(`${Logger}: fetchAuctionsByShopAddress failed, error=`, error);
      });
  }, [candyShop, offset, statusFilters, updateActivityStatus, walletAddress]);

  return (
    <div className="candy-activity-auction">
      <div className="candy-activity-auction-table-container" id="candy-activity-auction-scroll-target">
        <div className="candy-activity-auction-header candy-activity-auction-item">
          <span>BUYER ADDRESS</span>
          <span>PRICE</span>
          <span>STATUS</span>
        </div>

        <InfiniteScroll
          dataLength={auctions.length}
          next={offset === 0 ? DO_NOTHING_FUNC : getAuctions(offset, LIMIT)}
          loader={<Processing />}
          hasMore={hasMore}
        >
          {auctions.map((auction) => {
            return (
              <div key={auction.auctionAddress} className="candy-activity-auction-item">
                <div>
                  <ExplorerLink type="address" address={auction.highestBidBuyer || ''} />
                </div>
                <div className="candy-activity-auction-price">
                  {`${(
                    Number(auction.highestBidPrice || auction.startingBid) / candyShop.baseUnitsPerCurrency
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: candyShop.priceDecimalsMin,
                    maximumFractionDigits: candyShop.priceDecimals
                  })} ${candyShop.currencySymbol}`}
                </div>
                <div>{AuctionStatus[auction.status]}</div>
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
};
