import React, { useState, useCallback, useEffect } from 'react';

import { ExplorerLink } from 'components/ExplorerLink';
import { Processing } from 'components/Processing';
import { IconSolScan } from 'assets/IconSolScan';
import { IconExplorer } from 'assets/IconExplorer';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Blockchain, CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
import { Trade, ListBase, ShopStatusType, SortBy } from '@liqnft/candy-shop-types';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateSubject } from 'public/Context/CandyShopDataValidator';
import { ActivityActionsStatus } from 'constant';
import { removeDuplicate, EMPTY_FUNCTION } from 'utils/helperFunc';
import { IconSolanaFM } from 'assets/IconSolanaFM';
import { CommonChain, EthWallet } from '../../model';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import './style.less';
import { AnchorWallet } from '@solana/wallet-adapter-react';

interface ActivityType<C, S, W> extends CommonChain<C, S, W> {
  identifiers?: number[];
  orderBy?: SortBy[] | SortBy;
}
type ActivityProps =
  | ActivityType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | ActivityType<Blockchain.Solana, CandyShop, AnchorWallet>;

const LIMIT = 10;

const Logger = 'CandyShopUI/Activity';

export const Activity: React.FC<ActivityProps> = ({ identifiers, orderBy, ...chainProps }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const candyShopAddress = chainProps.candyShop.candyShopAddress.toString();
  useUpdateSubject({ subject: ShopStatusType.Trade, candyShopAddress: candyShopAddress });
  const updateActivityStatus = useValidateStatus(ActivityActionsStatus);

  const getTrades = useCallback(
    (offset: number, limit: number, firstLoad?: boolean) => () => {
      const getAction = (): Promise<any> => {
        switch (chainProps.blockchain) {
          case Blockchain.Solana:
            return chainProps.candyShop.transactions({ identifiers, offset, limit, sortBy: orderBy });
          default:
            return new Promise((res) => res(''));
        }
      };
      getAction()
        .then((res: ListBase<Trade>) => {
          const { result, offset, totalCount, count, success } = res;
          if (!success) {
            return setHasMore(false);
          }
          const hasMore = offset + count < Number(totalCount);
          if (hasMore) {
            setOffset(offset + count + 1);
          }

          setHasMore(hasMore);
          setTrades((list) => {
            if (firstLoad) return result || [];
            return removeDuplicate<Trade>(list, result, 'txHashAtCreation');
          });
        })
        .catch((error: any) => {
          console.log(`${Logger}: candyShop.transactions failed, error=`, error);
        });
    },
    [chainProps.blockchain, chainProps.candyShop, identifiers, orderBy]
  );

  useEffect(() => {
    getTrades(0, LIMIT)();
  }, [getTrades]);

  //update hook
  useEffect(() => {
    if (!updateActivityStatus) return;

    const getAction = (): Promise<any> => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana:
          return chainProps.candyShop.transactions({ identifiers, offset: 0, limit: 10, sortBy: orderBy });
        default:
          return new Promise((res) => res(''));
      }
    };

    getAction()
      .then((res: ListBase<Trade>) => {
        if (!res.success) return;
        setTrades((list) => {
          // prettier-ignore
          const newItems = res.result.filter((item) => list.findIndex((i) => i.txHashAtCreation === item.txHashAtCreation) === -1);
          if (newItems.length) return [...newItems, ...list];
          return list;
        });
      })
      .catch((error: any) => {
        console.log(`${Logger}: candyShop.transactions failed, error=`, error);
      });
  }, [chainProps.blockchain, chainProps.candyShop, identifiers, orderBy, updateActivityStatus]);

  return (
    <div className="candy-activity">
      <div className="candy-activity-table-container" id="candy-activity-scroll-target">
        <div className="candy-activity-header candy-activity-item">
          <span>NAME</span>
          <span>PRICE</span>
          <span>FROM</span>
          <span>TO</span>
          <span>TIME</span>
        </div>

        <InfiniteScroll
          dataLength={trades.length}
          next={offset === 0 ? EMPTY_FUNCTION : getTrades(offset, LIMIT)}
          loader={<Processing />}
          hasMore={hasMore}
        >
          {trades.map((trade) => {
            const timeInstance = dayjs(trade.createdAt);
            const tradeDate = timeInstance.format('YYYY-MM-DD');
            const tradeHour = timeInstance.fromNow();
            const NOW = dayjs().format('YYYY-MM-DD');

            const tradeTime = NOW === tradeDate ? tradeHour : tradeDate;
            return (
              <div key={trade.txHashAtCreation} className="candy-activity-item">
                <div>
                  <div className="candy-activity-name">
                    <img src={trade.nftImageUrl || 'assets/img-default.png'} alt={trade.nftName} />
                    <span className="candy-line-limit-1" title={trade.nftName}>
                      {trade.nftName}
                    </span>
                    <div className="candy-activity-icons">
                      <ExplorerLink type="tx" address={trade.txHashAtCreation} {...chainProps}>
                        <IconSolanaFM />
                      </ExplorerLink>
                      <ExplorerLink type="tx" address={trade.txHashAtCreation} {...chainProps}>
                        <IconSolScan />
                      </ExplorerLink>
                      <ExplorerLink type="tx" address={trade.txHashAtCreation} {...chainProps}>
                        <IconExplorer />
                      </ExplorerLink>
                    </div>
                  </div>
                </div>
                <div className="candy-activity-price">
                  {`${(Number(trade.price) / chainProps.candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
                    minimumFractionDigits: chainProps.candyShop.priceDecimalsMin,
                    maximumFractionDigits: chainProps.candyShop.priceDecimals
                  })} ${trade.shopSymbol}`}
                </div>
                <div>
                  <ExplorerLink type="address" address={trade.sellerAddress} {...chainProps} />
                </div>
                <div>
                  <ExplorerLink type="address" address={trade.buyerAddress} {...chainProps} />
                </div>
                <div className="candy-activity-time">{tradeTime}</div>
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
};
