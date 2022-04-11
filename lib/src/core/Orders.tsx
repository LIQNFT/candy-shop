import styled from '@emotion/styled';
import { web3 } from "@project-serum/anchor";
import { fetchOrdersByStoreId, SortBy } from 'api/backend/OrderAPI';
import { Empty } from 'components/Empty';
import { Order } from 'components/Order';
import { Skeleton } from 'components/Skeleton';
import { Dropdown } from 'components/Dropdown';
import { breakPoints } from 'constant/breakPoints';
import React, { useEffect, useState } from 'react';
import { CandyShop } from './CandyShop';

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
  walletPublicKey?: web3.PublicKey;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  style?: { [key: string]: string | number } | undefined;
}

/**
 * React component that displays a list of orders
 */
export const Orders: React.FC<OrdersProps> = ({
  walletPublicKey,
  candyShop,
  walletConnectComponent,
  style,
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // handle fetch data
  useEffect(() => {
    setLoading(true);
    candyShop
      .orders(sortedByOption.value)
      .then((data: any) => {
        if (!data.result) return;
        setOrders(data.result);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [candyShop, sortedByOption]);

  return (
    <>
      <Wrap style={style}>
        <div className="cds-container">
          <FilterContainer>
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
            />
          </FilterContainer>
          {loading ? (
            <Flex>
              {Array(4)
                .fill(0)
                .map((_, key) => (
                  <FlexItem key={key}>
                    <Skeleton />
                  </FlexItem>
                ))}
            </Flex>
          ) : !orders.length ? (
            <Empty description="No orders found" />
          ) : (
            <Flex>
              {orders.map((item, key) => (
                <FlexItem key={key}>
                  <Order
                    order={item}
                    walletPublicKey={walletPublicKey}
                    candyShop={candyShop}
                    walletConnectComponent={walletConnectComponent}
                  />
                </FlexItem>
              ))}
            </Flex>
          )}
        </div>
      </Wrap>
    </>
  );
};

const Wrap = styled.div`
  font-family: Helvetica, Arial, sans-serif;
  width: 100%;
`;

const FilterContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const Flex = styled.div`
  display: flex;
  flex-flow: row wrap;
  row-gap: 12px;
  column-gap: 12px;
  > * {
    width: calc((100% - 12px * 3) / 4);
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
