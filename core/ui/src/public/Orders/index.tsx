import { CandyShop } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { Skeleton } from 'components/Skeleton';
import { OrdersActionsStatus } from 'constant';
import { LOADING_SKELETON_COUNT, ORDER_FETCH_LIMIT, SORT_OPTIONS } from 'constant/Orders';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { ShopExchangeInfo } from 'model';
import { useUpdateCandyShopContext } from 'public/Context';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.less';

interface OrdersProps {
  walletConnectComponent: React.ReactElement;
  wallet: AnchorWallet | undefined;
  url?: string;
  identifiers?: number[];
  filters?: Array<{ name: string; identifier: number | Array<number> }>;
  style?: { [key: string]: string | number } | undefined;
  defaultFilterName?: string;
  candyShop: CandyShop;
  exchangeInfoMap?: Map<string, ShopExchangeInfo>;
  sellerAddress?: string;
}

/**
 * React component that displays a list of orders
 */
export const Orders: React.FC<OrdersProps> = ({
  walletConnectComponent,
  wallet,
  url,
  identifiers,
  filters,
  style,
  defaultFilterName,
  candyShop,
  exchangeInfoMap,
  sellerAddress
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);

  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [filterName, setFilterName] = useState<string | undefined>(undefined);
  const [filterIdentifiers, setFilterIdentifiers] = useState<number[] | undefined>(() => {
    if (filters && defaultFilterName) {
      const defaultFilter = filters.find((filter) => filter.name === defaultFilterName);
      if (defaultFilter !== undefined) {
        return Array.isArray(defaultFilter.identifier) ? defaultFilter.identifier : [defaultFilter.identifier];
      }
    }
  });
  const loadingMountRef = useRef(false);

  const updateOrderStatus = useValidateStatus(OrdersActionsStatus);
  useUpdateCandyShopContext(candyShop.candyShopAddress);

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
        getUniqueIdentifiers(),
        sellerAddress
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
    if (!loadingMountRef.current) {
      setLoading(true);
    }
    loadingMountRef.current = true;

    candyShop
      .orders(
        {
          sortBy: sortedByOption.value,
          offset: 0,
          limit: ORDER_FETCH_LIMIT
        },
        getUniqueIdentifiers(),
        sellerAddress
      )
      .then((data: any) => {
        if (!data.result) return;
        const haveNextPage = data.offset + data.count < data.totalCount;
        setHasNextPage(haveNextPage);
        setStartIndex(() => 0 + ORDER_FETCH_LIMIT);
        setOrders(data.result);
      })
      .catch((err) => {
        console.log('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sellerAddress, candyShop, getUniqueIdentifiers, sortedByOption.value, updateOrderStatus]);

  const loadingView = (
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

  const emptyView = <Empty description="No orders found" />;

  const infiniteOrderListView = (
    <InfiniteOrderList
      orders={orders}
      walletConnectComponent={walletConnectComponent}
      wallet={wallet}
      url={url}
      hasNextPage={hasNextPage}
      loadNextPage={loadNextPage(startIndex, ORDER_FETCH_LIMIT)}
      candyShop={candyShop}
      exchangeInfoMap={exchangeInfoMap}
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
