import React from 'react';
import { Order as OrderComponent } from 'components/Order';
import { Order } from 'solana-candy-shop-schema/dist';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from 'components/Skeleton';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from 'model';

interface InfiniteOrderListProps {
  orders: Order[];
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  url?: string;
  hasNextPage: boolean;
  loadNextPage: () => void;
  candyShop: CandyShop;
  exchangeInfoMap?: Map<string, ShopExchangeInfo>;
}

export const InfiniteOrderList: React.FC<InfiniteOrderListProps> = ({
  orders,
  wallet,
  walletConnectComponent,
  url,
  hasNextPage,
  loadNextPage,
  candyShop,
  exchangeInfoMap
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
          <OrderComponent
            order={order}
            walletConnectComponent={walletConnectComponent}
            wallet={wallet}
            url={url}
            candyShop={candyShop}
            exchangeInfoMap={exchangeInfoMap}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};
