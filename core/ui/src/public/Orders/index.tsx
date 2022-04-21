import React, { useEffect, useState } from 'react';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { Skeleton } from 'components/Skeleton';
import { CandyShop, OrderSortBy } from '@liqnft/candy-shop-sdk';
import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import './index.less';

const ORDER_FETCH_LIMIT = 12;
const LOADING_SKELETON_COUNT = 4;

const SORT_OPTIONS: { value: OrderSortBy; label: string }[] = [
  {
    value: {
      column: 'blockTimeAtCreation',
      order: 'desc'
    },
    label: 'Newest'
  },
  {
    value: {
      column: 'blockTimeAtCreation',
      order: 'asc'
    },
    label: 'Oldest'
  },
  {
    value: {
      column: 'price',
      order: 'asc'
    },
    label: 'Price: Low → High'
  },
  {
    value: {
      column: 'price',
      order: 'desc'
    },
    label: 'Price: High → Low'
  }
];

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
  const [filterIdentifiers, setFilterIdentifiers] = useState<
    number[] | undefined
  >(undefined);
  const [filterName, setFilterName] = useState<string | undefined>(undefined);

  const getUniqueIdentifiers = () => {
    let uniqueIdentifiers = [
      ...(identifiers || []),
      ...(filterIdentifiers || [])
    ];

    return [...new Set(uniqueIdentifiers)];
  };

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
  }, [candyShop, sortedByOption, filterIdentifiers, identifiers]);

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
                  }}
                  key={'All'}
                  className={!filterIdentifiers ? 'selected' : undefined}
                >
                  All
                </li>
                {filters.map((filter) => {
                  let filterArr = Array.isArray(filter.identifier)
                    ? filter.identifier
                    : [filter.identifier];

                  return (
                    <li
                      onClick={() => {
                        setFilterIdentifiers(filterArr);
                        setFilterName(filter.name);
                      }}
                      key={filter.name}
                      className={
                        filterName === filter.name ? 'selected' : undefined
                      }
                    >
                      {filter.name}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="candy-orders-content">
              {loading ? (
                <div className="candy-container-list">
                  {Array(LOADING_SKELETON_COUNT)
                    .fill(0)
                    .map((_, key) => (
                      <div key={key}>
                        <Skeleton />
                      </div>
                    ))}
                </div>
              ) : orders.length ? (
                <InfiniteOrderList
                  orders={orders}
                  walletConnectComponent={walletConnectComponent}
                  wallet={wallet}
                  candyShop={candyShop}
                  url={url}
                  hasNextPage={hasNextPage}
                  loadNextPage={loadNextPage(startIndex, ORDER_FETCH_LIMIT)}
                />
              ) : (
                <Empty description="No orders found" />
              )}
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
          {loading ? (
            <div className="candy-container-list">
              {Array(LOADING_SKELETON_COUNT)
                .fill(0)
                .map((_, key) => (
                  <div key={key}>
                    <Skeleton />
                  </div>
                ))}
            </div>
          ) : !loading && !orders.length ? (
            <Empty description="No orders found" />
          ) : (
            <InfiniteOrderList
              orders={orders}
              walletConnectComponent={walletConnectComponent}
              wallet={wallet}
              candyShop={candyShop}
              url={url}
              hasNextPage={hasNextPage}
              loadNextPage={() => loadNextPage(startIndex, ORDER_FETCH_LIMIT)}
            />
          )}
        </div>
      </div>
    </>
  );
};
