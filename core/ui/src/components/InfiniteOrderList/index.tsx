import React from 'react';
import { Order as OrderComponent } from 'components/Order';
import { Order } from 'solana-candy-shop-schema/dist';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from 'components/Skeleton';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop } from '@liqnft/candy-shop-sdk';

interface InfiniteOrderListProps {
  orders: Order[];
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  url?: string;
  hasNextPage: boolean;
  loadNextPage: () => void;
  candyShop: CandyShop;
}

export const InfiniteOrderList: React.FC<InfiniteOrderListProps> = ({
  orders,
  wallet,
  walletConnectComponent,
  url,
  hasNextPage,
  loadNextPage,
  candyShop
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
              url={url}
              candyShop={candyShop}
            />
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
};
