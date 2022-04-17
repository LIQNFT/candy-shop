import styled from '@emotion/styled';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { Skeleton } from 'components/Skeleton';
import { breakPoints } from 'constant/breakPoints';
import React, { useEffect, useState } from 'react';
import { CandyShop, OrderSortBy } from '@liqnft/candy-shop-sdk';
import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { AnchorWallet } from '@solana/wallet-adapter-react';

const ORDER_FETCH_LIMIT = 12;
const LOADING_SKELETON_COUNT = 4;

const SORT_OPTIONS: { value: OrderSortBy; label: string }[] = [
  {
    value: {
      column: 'blockTimeAtCreation',
      order: 'desc',
    },
    label: 'Newest',
  },
  {
    value: {
      column: 'blockTimeAtCreation',
      order: 'asc',
    },
    label: 'Oldest',
  },
  {
    value: {
      column: 'price',
      order: 'asc',
    },
    label: 'Price: Low → High',
  },
  {
    value: {
      column: 'price',
      order: 'desc',
    },
    label: 'Price: High → Low',
  },
];

interface OrdersProps {
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  wallet: AnchorWallet | undefined;
  url?: string;
  identifiers?: number[];
  filters?: Array<{ name: string; identifier: number }>;
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
  style,
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [filterIdentifiers, setFilterIdentifiers] = useState<
    number[] | undefined
  >(undefined);

  const loadNextPage = (startIndex: number, limit: number) => {
    candyShop
      .orders({ sortBy: sortedByOption.value, offset: startIndex, limit })
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

    let uniqueIdentifiers = [
      ...(identifiers || []),
      ...(filterIdentifiers || []),
    ];
    uniqueIdentifiers = [...new Set(uniqueIdentifiers)];

    candyShop
      .orders(
        {
          sortBy: sortedByOption.value,
          offset: 0,
          limit: ORDER_FETCH_LIMIT,
        },
        uniqueIdentifiers
      )
      .then((data: any) => {
        if (!data.result) return;
        if (data.offset + data.count >= data.totalCount) {
          setHasNextPage(false);
        } else {
          setHasNextPage(true);
        }
        setStartIndex((startIndex) => 0 + ORDER_FETCH_LIMIT);
        setOrders(data.result);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [candyShop, sortedByOption, filterIdentifiers]);

  if (filters) {
    return (
      <Wrap style={style}>
        <div className="candy-container">
          <SortContainerRight>
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
            />
          </SortContainerRight>
          <FlexWithFilter>
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
                  return (
                    <li
                      onClick={() => {
                        setFilterIdentifiers([filter.identifier]);
                      }}
                      key={filter.identifier}
                      className={
                        filterIdentifiers &&
                        filterIdentifiers[0] === filter.identifier
                          ? 'selected'
                          : undefined
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
                <Flex>
                  {Array(LOADING_SKELETON_COUNT)
                    .fill(0)
                    .map((_, key) => (
                      <FlexItem key={key}>
                        <Skeleton />
                      </FlexItem>
                    ))}
                </Flex>
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
                  loadNextPage={() =>
                    loadNextPage(startIndex, ORDER_FETCH_LIMIT)
                  }
                />
              )}
            </div>
          </FlexWithFilter>
        </div>
      </Wrap>
    );
  }

  return (
    <>
      <Wrap style={style}>
        <div className="candy-container">
          <SortContainer>
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
            />
          </SortContainer>
          {loading ? (
            <Flex>
              {Array(LOADING_SKELETON_COUNT)
                .fill(0)
                .map((_, key) => (
                  <FlexItem key={key}>
                    <Skeleton />
                  </FlexItem>
                ))}
            </Flex>
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
      </Wrap>
    </>
  );
};

const Wrap = styled.div`
  width: 100%;
  margin-bottom: 50px;
`;

const SortContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const SortContainerRight = styled.div`
  display: flex;
  margin-bottom: 16px;
  justify-content: flex-end;
`;

const Flex = styled.div`
  display: flex;
  flex-flow: row wrap;
  row-gap: 18px;
  column-gap: 18px;
  > * {
    width: calc((100% - 18px * 3) / 4);
  }

  @media ${breakPoints.tabletM} {
    row-gap: 16px;
    column-gap: 16px;
    > * {
      width: 100%;
    }
  }
`;

const FlexItem = styled.div``;

const FlexWithFilter = styled.div`
  display: flex;
  flex-flow: row wrap;

  > .candy-filter {
    text-align: left;
    width: 200px;
    padding-right: 20px;

    ul {
      list-style-type: none;

      li {
        line-height: 22px;
        font-size: 14px;
        cursor: pointer;
      }

      li.selected {
        font-weight: bold;
      }
    }

    .candy-filter-title {
      font-weight: bold;
      font-size: 16px;
      line-height: 26px;
      margin-bottom: 5px;
    }
  }

  > .candy-orders-content {
    flex: 1;
  }

  @media ${breakPoints.tabletM} {
    row-gap: 16px;
    column-gap: 16px;
    > * {
      width: 100%;
    }
  }
`;
