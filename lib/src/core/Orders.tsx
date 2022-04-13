import styled from '@emotion/styled';
import { web3 } from '@project-serum/anchor';
import { SortBy } from 'api/backend/OrderAPI';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { Skeleton } from 'components/Skeleton';
import { breakPoints } from 'constant/breakPoints';
import React, { useEffect, useState } from 'react';
import { CandyShop } from './CandyShop';
import { InfiniteOrderList } from 'components/InfiniteOrderList';

const ORDER_FETCH_LIMIT = 12;
const LOADING_SKELETON_COUNT = 4;

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
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
  walletPublicKey?: web3.PublicKey;
  url?: string;
  style?: { [key: string]: string | number } | undefined;
}

/**
 * React component that displays a list of orders
 */
export const Orders: React.FC<OrdersProps> = ({
  candyShop,
  walletConnectComponent,
  walletPublicKey,
  url,
  style,
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [firstLoadInProgress, setFirstLoadInProgress] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

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
    setFirstLoadInProgress(true);
    candyShop
      .orders({
        sortBy: sortedByOption.value,
        offset: 0,
        limit: ORDER_FETCH_LIMIT,
      })
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
        setFirstLoadInProgress(false);
      });
  }, [candyShop, sortedByOption]);

  return (
    <>
      <Wrap style={style}>
        <div className="candy-container">
          <FilterContainer>
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
            />
          </FilterContainer>
          {firstLoadInProgress ? (
            <Flex>
              {Array(LOADING_SKELETON_COUNT)
                .fill(0)
                .map((_, key) => (
                  <FlexItem key={key}>
                    <Skeleton />
                  </FlexItem>
                ))}
            </Flex>
          ) : !firstLoadInProgress && !orders.length ? (
            <Empty description="No orders found" />
          ) : (
            <InfiniteOrderList
              orders={orders}
              walletConnectComponent={walletConnectComponent}
              walletPublicKey={walletPublicKey}
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

const FilterContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
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
