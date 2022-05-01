import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { Skeleton } from 'components/Skeleton';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyContext } from 'public/Context';
import { ORDER_FETCH_LIMIT, LOADING_SKELETON_COUNT, SORT_OPTIONS } from 'constant/Orders';

import './index.less';

interface OrdersProps {
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  wallet: AnchorWallet | undefined;
  url?: string;
  identifiers?: number[];
  filters?: Array<{ name: string; identifier: number | Array<number> }>;
  style?: { [key: string]: string | number } | undefined;
}

/**
 * React component that displays a list of orders
 */
export const Orders: React.FC<OrdersProps> = ({
  candyShop,
  walletConnectComponent,
  wallet,
  url,
  identifiers,
  filters,
  style
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [filterIdentifiers, setFilterIdentifiers] = useState<number[]>();
  const [filterName, setFilterName] = useState<string | undefined>(undefined);
  const { refetch } = useContext(CandyContext);

  const getUniqueIdentifiers = useCallback(() => {
    const uniqueIdentifiers = [...(identifiers || []), ...(filterIdentifiers || [])];

    return [...new Set(uniqueIdentifiers)];
  }, [filterIdentifiers, identifiers]);

  const loadNextPage = (startIndex: number, limit: number) => () => {
    candyShop
      .orders(
        {
          sortBy: sortedByOption.value,
          offset: startIndex,
          limit
        },
        getUniqueIdentifiers()
      )
      .then((data: any) => {
        if (!data.result) return;
        if (data.offset + data.count >= data.totalCount) {
          setHasNextPage(false);
        } else {
          setHasNextPage(true);
        }
        setStartIndex((startIndex) => startIndex + limit);
        setOrders((existingOrders) => [...existingOrders, ...data.result]);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      });
  };

  useEffect(() => {
    setLoading(true);

    candyShop
      .orders(
        {
          sortBy: sortedByOption.value,
          offset: 0,
          limit: ORDER_FETCH_LIMIT
        },
        getUniqueIdentifiers()
      )
      .then((data: any) => {
        if (!data.result) return;
        const haveNextPage = data.offset + data.count < data.totalCount;
        setHasNextPage(haveNextPage);
        setStartIndex(() => 0 + ORDER_FETCH_LIMIT);
        setOrders(data.result);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    candyShop,
    sortedByOption,
    filterIdentifiers,
    identifiers,
    getUniqueIdentifiers,
    refetch // refetch when buy/sell/cancel nft
  ]);

  let loadingView = (
    <div className="candy-container-list">
      {Array(LOADING_SKELETON_COUNT)
        .fill(0)
        .map((_, key) => (
          <div key={key}>
            <Skeleton />
          </div>
        ))}
    </div>
  );

  let emptyView = <Empty description="No orders found" />;

  let infiniteOrderListView = (
    <InfiniteOrderList
      orders={orders}
      walletConnectComponent={walletConnectComponent}
      wallet={wallet}
      candyShop={candyShop}
      url={url}
      hasNextPage={hasNextPage}
      loadNextPage={loadNextPage(startIndex, ORDER_FETCH_LIMIT)}
    />
  );

  if (filters) {
    return (
      <div className="candy-orders-container" style={style}>
        <div className="candy-container">
          <div className="candy-orders-sort candy-orders-sort-right">
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
            />
          </div>
          <div className="candy-orders-filter">
            <div className="candy-filter">
              <div className="candy-filter-title">Filter by Collection</div>
              <ul className="candy-filter-by-collection">
                <li
                  onClick={() => {
                    setFilterIdentifiers(undefined);
                    setFilterName(undefined);
                  }}
                  key={'All'}
                  className={!filterIdentifiers ? 'selected' : undefined}
                >
                  All
                </li>
                {filters.map((filter) => {
                  const filterArr = Array.isArray(filter.identifier) ? filter.identifier : [filter.identifier];

                  return (
                    <li
                      onClick={() => {
                        setFilterIdentifiers(filterArr);
                        setFilterName(filter.name);
                      }}
                      key={filter.name}
                      className={filterName === filter.name ? 'selected' : undefined}
                    >
                      {filter.name}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="candy-orders-content">
              {loading ? loadingView : orders.length ? infiniteOrderListView : emptyView}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="candy-orders-container" style={style}>
        <div className="candy-container">
          <div className="candy-orders-sort">
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
            />
          </div>
          {loading ? loadingView : orders.length ? infiniteOrderListView : emptyView}
        </div>
      </div>
    </>
  );
};
