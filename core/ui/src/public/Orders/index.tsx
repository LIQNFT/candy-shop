import React, { useEffect, useState, useCallback } from 'react';
import { fetchOrdersByShopAddress } from '@liqnft/candy-shop-sdk';
import { ListBase, NftCollection, Order } from '@liqnft/candy-shop-types';
import { Search } from 'components/Search';
import { Dropdown } from 'components/Dropdown';

import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { PoweredBy } from 'components/PoweredBy';
import { CollectionFilter as CollectionFilterComponent, FilterType } from 'components/CollectionFilter';

import { CollectionFilter, OrderDefaultFilter, ShopProps } from '../../model';
import { removeDuplicate, removeListeners } from 'utils/helperFunc';
import { ORDER_FETCH_LIMIT, SORT_OPTIONS } from 'constant/Orders';
import { useSocket } from 'public/Context/Socket';
import { EventName } from 'constant/SocketEvent';
import './index.less';
import { handleError } from 'utils/ErrorHandler';

interface OrdersProps extends ShopProps {
  walletConnectComponent: React.ReactElement;
  url?: string;
  identifiers?: number[];
  filters?: CollectionFilter[] | boolean | 'auto';
  defaultFilter?: { [key in OrderDefaultFilter]: string };
  style?: { [key: string]: string | number };
  sellerAddress?: string;
  sellerUrl?: string;
  search?: boolean;
  filterSearch?: boolean;
  filterType?: FilterType;
}

// TODO: Remove hardcode option, filters, defaultFilter and shopFilters should merge into one config interface

/**
 * React component that displays a list of orders
 * @param filters:
 *    - true: list collections from that current shop
 *    - CollectionFilter: hardcode collections
 *    - auto: list collection from Shop filter UI, prop shopFilters=true
 */
export const Orders: React.FC<OrdersProps> = ({
  walletConnectComponent,
  url,
  identifiers,
  filters,
  style,
  sellerAddress,
  defaultFilter,
  sellerUrl,
  search,
  filterSearch,
  candyShop,
  wallet,
  filterType = 'list'
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [startIndex, setStartIndex] = useState(0);
  // manual collection filter
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter | undefined>(() => {
    if (Array.isArray(filters) && defaultFilter?.[OrderDefaultFilter.COLLECTION]) {
      return filters?.find((item) => item.collectionId === defaultFilter.collection);
    }
  });
  // auto collection filter
  const [selectedCollection, setSelectedCollection] = useState<NftCollection>();
  const [nftKeyword, setNftKeyword] = useState<string>();
  const { onSocketEvent } = useSocket();

  const onSearchNft = useCallback((nftName: string) => {
    setNftKeyword(nftName);
  }, []);

  const candyShopAddress = candyShop.candyShopAddress;

  const fetchOrders = useCallback(
    (offset: number) => {
      if (!candyShopAddress) return;

      fetchOrdersByShopAddress(candyShopAddress, {
        sortBy: [sortedByOption.value],
        offset,
        limit: ORDER_FETCH_LIMIT,
        sellerAddress,
        identifiers: getUniqueIdentifiers(identifiers, collectionFilter?.identifier),
        attribute: collectionFilter?.attribute,
        collectionId: selectedCollection?.id,
        nftName: nftKeyword,
        blockchain: candyShop.env
      })
        .then((res: ListBase<Order>) => {
          const { result, count, offset, totalCount } = res;

          setHasNextPage(offset + count < totalCount);
          setStartIndex((startIndex) => startIndex + ORDER_FETCH_LIMIT);
          setOrders((existingOrders) => {
            if (offset === 0) return result;
            return removeDuplicate<Order>(existingOrders, result, 'tokenMint');
          });
        })
        .catch((err: Error) => {
          console.info('fetchOrdersByShopAddress failed: ', err);
          setHasNextPage(false);
          handleError(err, 'Get orders failed.');
        });
    },
    [
      candyShop.env,
      candyShopAddress,
      collectionFilter?.attribute,
      collectionFilter?.identifier,
      identifiers,
      nftKeyword,
      selectedCollection?.id,
      sellerAddress,
      sortedByOption.value
    ]
  );

  const loadNextPage = (startIndex: number) => () => {
    if (startIndex === 0) return;
    fetchOrders(startIndex);
  };

  const onResetLoadingOrders = () => {
    setStartIndex(0);
    setHasNextPage(true);
  };

  const onChangeCollection = (item: NftCollection | CollectionFilter | undefined, type: 'auto' | 'manual') => () => {
    onResetLoadingOrders();
    if (type === 'auto') {
      setSelectedCollection(item as NftCollection);
    } else {
      setCollectionFilter(item as CollectionFilter);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, [fetchOrders]);

  useEffect(() => {
    const controllers = [
      onSocketEvent(EventName.orderOpened, (order: Order) => {
        setOrders((list) => {
          const newList = removeDuplicate<Order>([order], list, 'tokenMint');

          const { column, order: sortOrder } = sortedByOption.value as { column: keyof Order; order: 'asc' | 'desc' };
          const sortFunc = (a: Order, b: Order) =>
            (
              sortOrder === 'desc'
                ? (a[column] as string) > (b[column] as string)
                : (a[column] as string) < (b[column] as string)
            )
              ? -1
              : 1;

          newList.sort(sortFunc);
          return newList;
        });
      }),
      onSocketEvent(EventName.orderCanceled, (order: { tokenMint: string }) => {
        setOrders((list) => list.filter((item) => item.tokenMint !== order.tokenMint));
      }),
      onSocketEvent(EventName.orderFilled, (order: { tokenMint: string }) => {
        setOrders((list) => list.filter((item) => item.tokenMint !== order.tokenMint));
      })
    ];

    return () => removeListeners(controllers);
  }, [onSocketEvent, sortedByOption.value]);

  const InfiniteOrderListView = (
    <InfiniteOrderList
      orders={orders}
      walletConnectComponent={walletConnectComponent}
      url={url}
      hasNextPage={hasNextPage}
      loadNextPage={loadNextPage(startIndex)}
      sellerUrl={sellerUrl}
      candyShop={candyShop}
      wallet={wallet}
    />
  );

  if (filters) {
    return (
      <div className="candy-orders-container" style={style}>
        <div className="candy-container">
          <div className="candy-orders-sort candy-orders-sort-right">
            {search && <Search onSearch={onSearchNft} placeholder="Search NFTs" />}
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
              <div className="candy-filter-title">Filters</div>

              <CollectionFilterComponent
                onChange={onChangeCollection}
                selected={selectedCollection}
                filters={filters}
                selectedManual={collectionFilter}
                search={filterSearch}
                candyShopAddress={candyShopAddress}
                filterType={filterType}
              />
            </div>
            <div className="candy-orders-content">
              {InfiniteOrderListView}
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
            {search && <Search onSearch={onSearchNft} placeholder="Search NFTs" />}
          </div>
          {InfiniteOrderListView}
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
