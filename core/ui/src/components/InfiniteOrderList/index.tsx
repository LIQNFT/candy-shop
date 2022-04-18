import React from 'react';
import { Order as OrderComponent } from 'components/Order';
import { Order } from 'solana-candy-shop-schema/dist';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import InfiniteScroll from 'react-infinite-scroll-component';
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

export const InfiniteOrderList: React.FC<InfiniteOrderListProps> = ({
  orders,
  wallet,
  walletConnectComponent,
  candyShop,
  url,
  hasNextPage,
  loadNextPage
}) => {
  return (
    <InfiniteScroll
      dataLength={orders.length}
      next={loadNextPage}
      hasMore={hasNextPage}
      loader={
        <div className="candy-container-list">
          {Array(4)
            .fill(0)
            .map((_, key) => (
              <div key={key}>
                <Skeleton />
              </div>
            ))}
        </div>
      }
    >
      <div className="candy-container-list">
        {orders.map((order) => (
          <div key={order.tokenMint}>
            <OrderComponent
              order={order}
              walletConnectComponent={walletConnectComponent}
              wallet={wallet}
              candyShop={candyShop}
              url={url}
            />
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
};
