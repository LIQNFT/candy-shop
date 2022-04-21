import React, { useEffect, useState, useCallback } from 'react';
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

export interface FilterData {
  collectionName: string;
  identifier: number;
}

interface OrdersProps {
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  wallet: AnchorWallet | undefined;
  url?: string;
  identifiers?: number[];
  filters?: Array<FilterData>;
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
  const [filterIdentifiers, setFilterIdentifiers] = useState<number[]>([]);

  const getUniqueIdentifiers = useCallback(() => {
    const uniqueIdentifiers = [...(identifiers || []), ...filterIdentifiers];

    return [...new Set(uniqueIdentifiers)];
  }, [identifiers, filterIdentifiers]);

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
      .catch((err: any) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      });
  };

  const onSelectFilter = (selectedId: number | undefined) => {
    let cloneFilters = [...filterIdentifiers];
    if (selectedId) {
      if (cloneFilters.includes(selectedId)) {
        // Remove selected identifier from current filters as deselection
        cloneFilters = cloneFilters.filter((id) => id !== selectedId);
      } else {
        cloneFilters.push(selectedId);
      }
    }
    console.log('Orders: filtering with identifiers=', cloneFilters);
    setFilterIdentifiers(cloneFilters);
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
      .catch((err: any) => {
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
    getUniqueIdentifiers
  ]);

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
                <label onClick={() => onSelectFilter(undefined)} key={'All'}>
                  <input
                    type="checkbox"
                    checked={filterIdentifiers.length === 0}
                  />
                  All
                </label>
                {filters.map((filter) => {
                  return (
                    <label
                      onClick={() => onSelectFilter(filter.identifier)}
                      key={filter.identifier}
                    >
                      <input
                        type="checkbox"
                        checked={filterIdentifiers.includes(filter.identifier)}
                      />
                      {filter.collectionName}
                    </label>
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
