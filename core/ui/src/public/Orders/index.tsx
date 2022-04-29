import React, { useEffect, useState, useRef } from 'react';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { Skeleton } from 'components/Skeleton';
import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ORDER_FETCH_LIMIT, LOADING_SKELETON_COUNT, SORT_OPTIONS } from 'constant/Orders';
import { OrdersActionsStatus } from 'constant';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateCandyShopContext } from 'public/Context';
import { CollectionFilter, ShopFilter, OrderDefaultFilter } from 'model';
import './index.less';

interface OrdersProps {
  walletConnectComponent: React.ReactElement;
  wallet?: AnchorWallet;
  url?: string;
  identifiers?: number[];
  filters?: CollectionFilter[];
  defaultFilter?: { [key in OrderDefaultFilter]: string };
  shopFilters?: ShopFilter[];
  style?: { [key: string]: string | number };
  candyShop: CandyShop;
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
  candyShop,
  sellerAddress,
  shopFilters,
  defaultFilter
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter | undefined>(() => {
    if (defaultFilter?.[OrderDefaultFilter.COLLECTION]) {
      return filters?.find((item) => item.name === defaultFilter.COLLECTION);
    }
  });
  const [shopFilter, setShopFilter] = useState<ShopFilter | undefined>(() => {
    if (defaultFilter?.[OrderDefaultFilter.SHOP]) {
      return shopFilters?.find((shop) => shop.name === defaultFilter.SHOP);
    }
  });

  const loadingMountRef = useRef(false);

  const updateOrderStatus = useValidateStatus(OrdersActionsStatus);
  useUpdateCandyShopContext(candyShop.candyShopAddress);

  const loadNextPage = (startIndex: number, limit: number) => () => {
    candyShop
      .orders({
        sortBy: sortedByOption.value,
        offset: startIndex,
        limit,
        identifiers: getUniqueIdentifiers(identifiers, collectionFilter?.identifier),
        sellerAddress,
        attribute: collectionFilter?.attribute,
        candyShopAddress: shopFilter?.shopId
      })
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
      .orders({
        sortBy: sortedByOption.value,
        offset: 0,
        limit: ORDER_FETCH_LIMIT,
        identifiers: getUniqueIdentifiers(identifiers, collectionFilter?.identifier),
        sellerAddress,
        attribute: collectionFilter?.attribute,
        candyShopAddress: shopFilter?.shopId
      })
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
  }, [candyShop, sortedByOption.value, updateOrderStatus, sellerAddress, identifiers, collectionFilter, shopFilter]);

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
    />
  );

  if (filters || shopFilters) {
    return (
      <div className="candy-orders-container" style={style}>
        <div className="candy-container">
          <div className="candy-orders-sort candy-orders-sort-right">
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
              defaultValue={SORT_OPTIONS[0]}
            />
          </div>
          <div className="candy-orders-filter">
            <div className="candy-filter">
              {filters ? (
                <>
                  <div className="candy-filter-title">Filter by Collection</div>
                  <ul>
                    <li
                      onClick={() => setCollectionFilter(undefined)}
                      key="All"
                      className={collectionFilter ? '' : 'selected'}
                    >
                      All
                    </li>
                    {filters?.map((filter) => {
                      return (
                        <li
                          key={filter.name}
                          className={collectionFilter?.name === filter.name ? 'selected' : ''}
                          onClick={() => setCollectionFilter(filter)}
                        >
                          {filter.name}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}

              {shopFilters ? (
                <>
                  <div className="candy-filter-title">Filter by Shop</div>
                  <ul>
                    <li onClick={() => setShopFilter(undefined)} key="All" className={shopFilter ? '' : 'selected'}>
                      All
                    </li>
                    {shopFilters.map((item) => {
                      return (
                        <li
                          key={item.name}
                          className={shopFilter?.name === item.name ? 'selected' : ''}
                          onClick={() => setShopFilter(item)}
                        >
                          {item.name}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}

              {/* <div className="candy-filter-title">Attributes</div>
              {FILTER_ATTRIBUTES_MOCK: constant/Orders}
               {FILTER_ATTRIBUTES_MOCK.map((attr) => {
                return (
                  <div className="candy-filter-attribute">
                    <span>{attr.name}</span>
                    <Dropdown items={attr.options} onSelectItem={onFilterAttribute} placeholder={attr.placeholder} />
                  </div>
                );
              })} */}
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
              defaultValue={SORT_OPTIONS[0]}
            />
          </div>
          {loading ? loadingView : orders.length ? infiniteOrderListView : emptyView}
        </div>
      </div>
    </>
  );
};

function getUniqueIdentifiers(identifiers: number[] = [], filterIdentifiers: number | number[] = []) {
  return [
    ...new Set([...identifiers, ...(typeof filterIdentifiers === 'number' ? [filterIdentifiers] : filterIdentifiers)])
  ];
}
