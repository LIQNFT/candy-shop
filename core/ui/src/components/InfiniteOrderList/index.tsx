import React, { useMemo, useState } from 'react';
import { Order } from '@liqnft/candy-shop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CandyShop, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';
import { getDefaultExchange, getExchangeInfo } from 'utils/getExchangeInfo';
import { BuyModal } from 'components/BuyModal';
import { CancelModal } from 'components/CancelModal';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { Order as OrderComponent } from 'components/Order';
import { ShopProps } from 'model';
import { StoreProvider } from 'market';
import { Empty } from 'components/Empty';

interface InfiniteOrderListProps extends ShopProps {
  orders: Order[];
  walletConnectComponent: React.ReactElement;
  url?: string;
  hasNextPage: boolean;
  loadNextPage: () => void;
  sellerUrl?: string;
}

export const InfiniteOrderList: React.FC<InfiniteOrderListProps> = ({
  orders,
  walletConnectComponent,
  url,
  hasNextPage,
  loadNextPage,
  sellerUrl,
  candyShop,
  wallet
}) => {
  const store = useMemo(() => StoreProvider({ candyShop, wallet }), [candyShop, wallet]);

  const cancelOrder = (order: Order) => {
    return store.cancel(order);
  };

  const buyNft = (order: Order) => {
    return store.buy(order);
  };

  const [selectedOrder, setSelectedOrder] = useState<OrderSchema>();
  const onSelectOrder = (order?: OrderSchema) => setSelectedOrder(order);

  const exchangeInfo =
    candyShop instanceof CandyShop ? getExchangeInfo(selectedOrder, candyShop) : getDefaultExchange(candyShop);

  const isUserListing =
    selectedOrder &&
    wallet?.publicKey &&
    selectedOrder.walletAddress.toLocaleLowerCase() === wallet.publicKey.toString().toLowerCase();

  const shopAddress = useMemo(() => {
    if (!selectedOrder) return '';

    if (candyShop instanceof CandyShop) {
      return getCandyShopSync(
        new web3.PublicKey(selectedOrder.candyShopCreatorAddress),
        new web3.PublicKey(selectedOrder.treasuryMint),
        new web3.PublicKey(selectedOrder.programId)
      )[0].toString();
    } else {
      return candyShop.candyShopAddress;
    }
  }, [candyShop, selectedOrder]);

  return (
    <>
      {orders.length > 0 ? (
        <InfiniteScroll
          dataLength={orders.length}
          next={loadNextPage}
          hasMore={hasNextPage}
          loader={<LoadingSkeleton />}
        >
          <div className="candy-container-list">
            {orders.map((order) => (
              <div key={order.tokenMint}>
                <OrderComponent
                  order={order}
                  walletConnectComponent={walletConnectComponent}
                  url={url}
                  sellerUrl={sellerUrl}
                  onOrderSelection={onSelectOrder}
                  candyShop={candyShop}
                  wallet={wallet}
                />
              </div>
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <Empty description="No orders found" />
      )}

      {selectedOrder && !isUserListing ? (
        <BuyModal
          shopAddress={shopAddress}
          order={selectedOrder}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={candyShop.priceDecimalsMin}
          shopPriceDecimals={candyShop.priceDecimals}
          sellerUrl={sellerUrl}
          walletConnectComponent={walletConnectComponent}
          candyShopEnv={candyShop.env}
          explorerLink={candyShop.explorerLink}
          walletPublicKey={wallet?.publicKey?.toString()}
          onClose={() => onSelectOrder(undefined)}
          buyNft={buyNft}
        />
      ) : null}
      {selectedOrder && isUserListing && wallet.publicKey ? (
        <CancelModal
          publicKey={wallet.publicKey.toString()}
          onClose={() => onSelectOrder(undefined)}
          order={selectedOrder}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={candyShop.priceDecimalsMin}
          shopPriceDecimals={candyShop.priceDecimals}
          cancelOrder={cancelOrder}
          candyShopEnv={candyShop.env}
          explorerLink={candyShop.explorerLink}
        />
      ) : null}
    </>
  );
};
