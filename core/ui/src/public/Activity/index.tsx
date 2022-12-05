import React, { useState, useCallback, useEffect } from 'react';

import { ExplorerLink } from 'components/ExplorerLink';
import { Processing } from 'components/Processing';
import { IconSolScan } from 'assets/IconSolScan';
import { IconExplorer } from 'assets/IconExplorer';
import InfiniteScroll from 'react-infinite-scroll-component';

import { fetchTradeByShopAddress, ExplorerLinkBase, BlockchainType } from '@liqnft/candy-shop-sdk';
import { EventName } from 'constant/SocketEvent';
import { Blockchain, Trade, ListBase, SortBy } from '@liqnft/candy-shop-types';
import { removeDuplicate, EMPTY_FUNCTION } from 'utils/helperFunc';
import { IconSolanaFM } from 'assets/IconSolanaFM';
import { IconPolygon } from 'assets/IconPolygon';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import './style.less';
import { useSocket } from 'public/Context/Socket';
import { useUpdateCandyShopContext } from 'public/Context/CandyShopDataValidator';
import { ShopProps } from '../../model';

import { getBlockChain } from 'utils/getBlockchain';
import { IconEth } from 'assets/IconEth';
import { handleError } from 'utils/ErrorHandler';

interface ActivityProps extends ShopProps {
  identifiers?: number[];
  orderBy?: SortBy[] | SortBy;
}

const LIMIT = 10;

const Logger = 'CandyShopUI/Activity';

export const Activity: React.FC<ActivityProps> = ({ identifiers, orderBy, candyShop }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const { onSocketEvent } = useSocket();

  useUpdateCandyShopContext({
    candyShopAddress: candyShop.candyShopAddress,
    network: candyShop.env
  });

  const getTrades = useCallback(
    (offset: number, limit: number, firstLoad?: boolean) => () => {
      fetchTradeByShopAddress(candyShop.candyShopAddress, { identifiers, offset, limit, sortBy: orderBy })
        .then((res: ListBase<Trade>) => {
          const { result, offset, totalCount, count } = res;

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
        .catch((error: Error) => {
          setHasMore(false);
          handleError(error, 'Get trades failed');
          console.log(`${Logger}: candyShop.transactions failed, error=`, error);
        });
    },
    [candyShop.candyShopAddress, identifiers, orderBy]
  );

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    setTrades([]);
    getTrades(0, LIMIT)();
  }, [getTrades]);

  useEffect(() => {
    const controller = onSocketEvent(EventName.traded, (data: Trade) => {
      setTrades((list) => {
        const trades = removeDuplicate([data], list, 'txHashAtCreation');
        if (trades.length === list.length + 1) {
          setOffset((offset) => offset + 1);
        }
        return trades;
      });
    });

    return () => controller.abort();
  }, [onSocketEvent]);

  const etherumEnvIconTrans = (env: Blockchain) => {
    switch (env) {
      case Blockchain.Eth:
        return <IconEth />;
      case Blockchain.EthTestnet:
        return <IconEth />;
      case Blockchain.Polygon:
        return <IconPolygon />;
      case Blockchain.PolygonTestnet:
        return <IconPolygon />;
    }
  };

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
            const blockchain = getBlockChain(candyShop.env);

            return (
              <div key={trade.txHashAtCreation} className="candy-activity-item">
                <div>
                  <div className="candy-activity-name">
                    <img src={trade.nftImageUrl || 'assets/img-default.png'} alt={trade.nftName} />
                    <span className="candy-line-limit-1" title={trade.nftName}>
                      {trade.nftName}
                    </span>
                    <div className="candy-activity-icons">
                      {blockchain == BlockchainType.SOL ? (
                        <>
                          <ExplorerLink
                            type="tx"
                            address={trade.txHashAtCreation}
                            candyShopEnv={candyShop.env}
                            explorerLink={ExplorerLinkBase.SolanaFM}
                          >
                            <IconSolanaFM />
                          </ExplorerLink>
                          <ExplorerLink
                            type="tx"
                            address={trade.txHashAtCreation}
                            candyShopEnv={candyShop.env}
                            explorerLink={ExplorerLinkBase.SolScan}
                          >
                            <IconSolScan />
                          </ExplorerLink>
                          <ExplorerLink
                            type="tx"
                            address={trade.txHashAtCreation}
                            candyShopEnv={candyShop.env}
                            explorerLink={ExplorerLinkBase.Explorer}
                          >
                            <IconExplorer />
                          </ExplorerLink>
                        </>
                      ) : (
                        <>
                          <ExplorerLink
                            type="tx"
                            address={trade.txHashAtCreation}
                            candyShopEnv={candyShop.env}
                            explorerLink={candyShop.explorerLink}
                          >
                            {etherumEnvIconTrans(candyShop.env)}
                          </ExplorerLink>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="candy-activity-price">
                  {`${(Number(trade.price) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
                    minimumFractionDigits: candyShop.priceDecimalsMin,
                    maximumFractionDigits: candyShop.priceDecimals
                  })} `}
                  {trade.shopSymbol}
                </div>
                <div>
                  <ExplorerLink
                    type="address"
                    address={trade.sellerAddress}
                    candyShopEnv={candyShop.env}
                    explorerLink={candyShop.explorerLink}
                  />
                </div>
                <div>
                  <ExplorerLink
                    type="address"
                    address={trade.buyerAddress}
                    candyShopEnv={candyShop.env}
                    explorerLink={candyShop.explorerLink}
                  />
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
