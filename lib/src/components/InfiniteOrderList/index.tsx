import React from 'react';
import { Order as OrderComponent } from 'components/Order';
import { Order } from 'solana-candy-shop-schema/dist';
import { CandyShop } from '@liqnft/candy-shop-common';
import InfiniteScroll from 'react-infinite-scroll-component';
import styled from '@emotion/styled';
import { breakPoints } from 'constant/breakPoints';
import { Skeleton } from 'components/Skeleton';
import { AnchorWallet } from '@solana/wallet-adapter-react';

interface InfiniteOrderListProps {
  orders: Order[];
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement<
    any,
    string | React.JSXElementConstructor<any>
  >;
  candyShop: CandyShop;
  url?: string;
  hasNextPage: boolean;
  loadNextPage: () => void;
}

export const InfiniteOrderList: React.FunctionComponent<
  InfiniteOrderListProps
> = ({
  orders,
  wallet,
  walletConnectComponent,
  candyShop,
  url,
  hasNextPage,
  loadNextPage,
}) => {
  return (
    <InfiniteScroll
      dataLength={orders.length}
      next={loadNextPage}
      hasMore={hasNextPage}
      loader={
        <Flex>
          {Array(4)
            .fill(0)
            .map((_, key) => (
              <FlexItem key={key}>
                <Skeleton />
              </FlexItem>
            ))}
        </Flex>
      }
    >
      <Flex>
        {orders.map((item, key) => (
          <FlexItem key={key}>
            <OrderComponent
              order={item}
              walletConnectComponent={walletConnectComponent}
              wallet={wallet}
              candyShop={candyShop}
              url={url}
            />
          </FlexItem>
        ))}
      </Flex>
    </InfiniteScroll>
  );
};

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
