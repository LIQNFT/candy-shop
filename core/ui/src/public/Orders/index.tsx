import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { PoweredBy } from 'components/PoweredBy';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ORDER_FETCH_LIMIT, SORT_OPTIONS } from 'constant/Orders';
import { OrdersActionsStatus } from 'constant';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateSubject } from 'public/Context';
import { CollectionFilter, ShopFilter, OrderDefaultFilter } from 'model';
import { ListBase, Order, ShopStatusType } from '@liqnft/candy-shop-types';
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
      return filters?.find((item) => item.collectionId === defaultFilter.collection);
    }
  });
  const [shopFilter, setShopFilter] = useState<ShopFilter | undefined>(() => {
    if (defaultFilter?.[OrderDefaultFilter.SHOP]) {
      return shopFilters?.find((shop) => shop.shopId === defaultFilter.shop);
    }
  });

  const loadingMountRef = useRef(false);

  const updateOrderStatus = useValidateStatus(OrdersActionsStatus);
  useUpdateSubject(ShopStatusType.Order, candyShop.candyShopAddress);

  const fetchOrders = useCallback(
    (offset: number) => {
      candyShop
        .orders({
          sortBy: [sortedByOption.value],
          offset,
          limit: ORDER_FETCH_LIMIT,
          identifiers: getUniqueIdentifiers(identifiers, collectionFilter?.identifier),
          sellerAddress,
          attribute: collectionFilter?.attribute,
          candyShopAddress: shopFilter?.shopId
        })
        .then((res: ListBase<Order>) => {
          if (!res.success) {
            setHasNextPage(false);
            return;
          }
          const { result, count, offset, totalCount } = res;

          setHasNextPage(offset + count < totalCount);
          setStartIndex((startIndex) => startIndex + ORDER_FETCH_LIMIT);
          setOrders((existingOrders) => {
            if (offset === 0) return result;

            const duplicateOrderList = [...existingOrders, ...result];
            const newOrderList: Order[] = [];
            const memo: any = {};

            duplicateOrderList.forEach((order) => {
              if (memo[order.tokenMint]) return;
              newOrderList.push(order);
              memo[order.tokenMint] = true;
            });

            return newOrderList;
          });
        })
        .catch((err) => {
          console.info('fetchOrdersByStoreId failed: ', err);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [candyShop, collectionFilter, identifiers, sellerAddress, shopFilter?.shopId, sortedByOption]
  );

  const loadNextPage = (startIndex: number) => () => {
    if (startIndex === 0) return;
    fetchOrders(startIndex);
  };

  useEffect(() => {
    if (!loadingMountRef.current) {
      setLoading(true);
    }
    loadingMountRef.current = true;

    fetchOrders(0);
  }, [fetchOrders, updateOrderStatus]);

  const emptyView = <Empty description="No orders found" />;

  const infiniteOrderListView = (
    <InfiniteOrderList
      orders={orders}
      walletConnectComponent={walletConnectComponent}
      wallet={wallet}
      url={url}
      hasNextPage={hasNextPage}
      loadNextPage={loadNextPage(startIndex)}
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
              onSelectItem={(item) => {
                setSortedByOption(item);
                setStartIndex(0);
              }}
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
                      onClick={() => {
                        setCollectionFilter(undefined);
                        setStartIndex(0);
                      }}
                      key="All"
                      className={collectionFilter ? '' : 'selected'}
                    >
                      All
                    </li>
                    {filters?.map((filter) => {
                      return (
                        <li
                          key={filter.name}
                          className={collectionFilter?.collectionId === filter.collectionId ? 'selected' : ''}
                          onClick={() => {
                            setCollectionFilter(filter);
                            setStartIndex(0);
                          }}
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
                    <li
                      onClick={() => {
                        setShopFilter(undefined);
                        setStartIndex(0);
                      }}
                      key="All"
                      className={shopFilter ? '' : 'selected'}
                    >
                      All
                    </li>
                    {shopFilters.map((item) => {
                      return (
                        <li
                          key={item.name}
                          className={shopFilter?.shopId === item.shopId ? 'selected' : ''}
                          onClick={() => {
                            setShopFilter(item);
                            setStartIndex(0);
                          }}
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
              {loading ? <LoadingSkeleton /> : orders.length ? infiniteOrderListView : emptyView}
              <PoweredBy />
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
          {loading ? <LoadingSkeleton /> : orders.length ? infiniteOrderListView : emptyView}
          <PoweredBy />
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
