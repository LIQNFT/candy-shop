import React, { useEffect, useState, useRef, useCallback } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop } from '@liqnft/candy-shop-sdk';

import {
  ListBase,
  NftCollection,
  Order,
  ShopStatusType,
  CandyShop as CandyShopResponse
} from '@liqnft/candy-shop-types';

import { Search } from 'components/Search';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { PoweredBy } from 'components/PoweredBy';
import { CollectionFilter as CollectionFilterComponent } from 'components/CollectionFilter';
import { ShopFilter as ShopFilterComponent } from 'components/ShopFilter';

import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateSubject } from 'public/Context';
import { CollectionFilter, ShopFilter, OrderDefaultFilter } from 'model';
import { removeDuplicate } from 'utils/array';
import { OrdersActionsStatus } from 'constant';
import { ORDER_FETCH_LIMIT, SORT_OPTIONS } from 'constant/Orders';
import './index.less';

interface OrdersProps {
  walletConnectComponent: React.ReactElement;
  wallet?: AnchorWallet;
  url?: string;
  identifiers?: number[];
  filters?: CollectionFilter[] | boolean;
  defaultFilter?: { [key in OrderDefaultFilter]: string };
  shopFilters?: ShopFilter[] | boolean;
  style?: { [key: string]: string | number };
  candyShop: CandyShop;
  sellerAddress?: string;
  sellerUrl?: string;
  search?: boolean;
  filterSearch?: boolean;
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
  defaultFilter,
  sellerUrl,
  search,
  filterSearch
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  // manual collection filter
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter | undefined>(() => {
    if (Array.isArray(filters) && defaultFilter?.[OrderDefaultFilter.COLLECTION]) {
      return filters?.find((item) => item.collectionId === defaultFilter.collection);
    }
  });
  // auto collection filter
  const [selectedCollection, setSelectedCollection] = useState<NftCollection>();

  // manual shop filter
  const [shopFilter, setShopFilter] = useState<ShopFilter | undefined>(() => {
    if (Array.isArray(shopFilters) && defaultFilter?.[OrderDefaultFilter.SHOP]) {
      return shopFilters?.find((shop) => shop.shopId === defaultFilter.shop);
    }
  });
  // auction shop filter
  const [selectedShop, setSelectedShop] = useState<CandyShopResponse>();
  const [nftKeyword, setNftKeyword] = useState<string>();

  const loadingMountRef = useRef(false);

  const updateOrderStatus = useValidateStatus(OrdersActionsStatus);
  useUpdateSubject(ShopStatusType.Order, candyShop.candyShopAddress);

  const onSearchNft = useCallback((nftName: string) => {
    setNftKeyword(nftName);
  }, []);

  const fetchOrders = useCallback(
    (offset: number) => {
      candyShop
        .orders({
          sortBy: [sortedByOption.value],
          offset,
          limit: ORDER_FETCH_LIMIT,
          sellerAddress,
          identifiers: getUniqueIdentifiers(identifiers, collectionFilter?.identifier),
          attribute: collectionFilter?.attribute,
          collectionId: selectedCollection?.id,
          candyShopAddress: selectedShop?.candyShopAddress || shopFilter?.shopId,
          nftName: nftKeyword
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
            return removeDuplicate<Order>(existingOrders, result, 'tokenMint');
          });
        })
        .catch((err: Error) => {
          console.info('fetchOrdersByStoreId failed: ', err);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [
      candyShop,
      collectionFilter,
      identifiers,
      sellerAddress,
      shopFilter?.shopId,
      sortedByOption,
      selectedCollection,
      selectedShop,
      nftKeyword
    ]
  );

  const loadNextPage = (startIndex: number) => () => {
    if (startIndex === 0) return;
    fetchOrders(startIndex);
  };

  const onResetLoadingOrders = () => {
    setStartIndex(0);
    setHasNextPage(true);
    setLoading(true);
  };

  const onResetCollectionFilter = () => {
    setSelectedCollection(undefined);
    setCollectionFilter(undefined);
  };

  const onResetShopFilter = () => {
    setSelectedShop(undefined);
    setShopFilter(undefined);
  };

  const onChangeCollection = (item: NftCollection | CollectionFilter | undefined, type: 'auto' | 'manual') => () => {
    onResetLoadingOrders();
    onResetShopFilter();
    if (type === 'auto') {
      setSelectedCollection(item as NftCollection);
    } else {
      setCollectionFilter(item as CollectionFilter);
    }
  };

  const onChangeShop = (item: ShopFilter | CandyShopResponse | undefined, type: 'auto' | 'manual') => () => {
    onResetLoadingOrders();
    onResetCollectionFilter();
    if (type === 'auto') {
      setSelectedShop(item as CandyShopResponse);
    } else {
      setShopFilter(item as ShopFilter);
    }
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
      sellerUrl={sellerUrl}
    />
  );

  if (filters || shopFilters) {
    const onClickAll = () => {
      setSelectedCollection(undefined);
      setCollectionFilter(undefined);

      setSelectedShop(undefined);
      setShopFilter(undefined);
    };
    const showAll = Boolean(filters && shopFilters);
    const selectAll = showAll && !selectedCollection && !selectedShop && !shopFilter && !collectionFilter;

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
              {showAll && (
                <div
                  onClick={onClickAll}
                  className={selectAll ? 'candy-filter-all candy-filter-all-active' : 'candy-filter-all'}
                >
                  All
                </div>
              )}
              {Boolean(filters) && (
                <CollectionFilterComponent
                  onChange={onChangeCollection}
                  selected={selectedCollection}
                  candyShop={candyShop}
                  filters={filters}
                  selectedManual={collectionFilter}
                  shopId={selectedShop?.candyShopAddress || shopFilter?.shopId}
                  showAllFilters={showAll}
                  search={filterSearch}
                />
              )}
              {Boolean(shopFilters) === true && (
                <ShopFilterComponent
                  onChange={onChangeShop}
                  candyShop={candyShop}
                  selected={selectedShop}
                  filters={shopFilters}
                  selectedManual={shopFilter}
                  showAllFilters={showAll}
                  search={filterSearch}
                />
              )}

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
            {search && <Search onSearch={onSearchNft} placeholder="Search NFTs" />}
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
