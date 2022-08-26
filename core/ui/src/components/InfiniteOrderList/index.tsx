import React, { useMemo, useState } from 'react';
import { Order as OrderComponent } from 'components/Order';
import { Order } from '@liqnft/candy-shop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { BlockchainType, CandyShop, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { getDefaultExchange, getExchangeInfo } from 'utils/getExchangeInfo';
import { BuyModal } from 'components/BuyModal';
import { CancelModal } from 'components/CancelModal';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { ShopProps } from 'model';
import { CancelerFactory } from 'services/canceler';
import { BuyerFactory } from 'services/buyer';
import { web3 } from '@project-serum/anchor';

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
  blockchain,
  candyShop,
  wallet
}) => {
  const { canceler, buyer } = useMemo(() => {
    return {
      canceler: CancelerFactory({ candyShop, wallet, blockchain }),
      buyer: BuyerFactory({ candyShop, wallet, blockchain })
    };
  }, [candyShop, blockchain, wallet]);

  const cancelOrder = (order: Order) => {
    return canceler.cancel(order);
  };

  const buyNft = (order: Order) => {
    return buyer.buy(order);
  };

  const [selectedOrder, setSelectedOrder] = useState<OrderSchema>();
  const onSelectOrder = (order?: OrderSchema) => setSelectedOrder(order);

  const exchangeInfo =
    blockchain === BlockchainType.Solana
      ? getExchangeInfo(selectedOrder, candyShop as CandyShop)
      : getDefaultExchange(candyShop);

  const isUserListing =
    selectedOrder &&
    wallet?.publicKey &&
    selectedOrder.walletAddress.toLocaleLowerCase() === wallet.publicKey.toString().toLowerCase();

  const shopAddress = useMemo(() => {
    if (!selectedOrder) return '';

    if (blockchain === BlockchainType.Solana) {
      return getCandyShopSync(
        new web3.PublicKey(selectedOrder.candyShopCreatorAddress),
        new web3.PublicKey(selectedOrder.treasuryMint),
        new web3.PublicKey(selectedOrder.programId)
      )[0].toString();
    } else {
      return candyShop.candyShopAddress;
    }
  }, [blockchain, candyShop.candyShopAddress, selectedOrder]);

  return (
    <>
      <InfiniteScroll dataLength={orders.length} next={loadNextPage} hasMore={hasNextPage} loader={<LoadingSkeleton />}>
        <div className="candy-container-list">
          {orders.map((order) => (
            <div key={order.tokenMint}>
              <OrderComponent
                order={order}
                walletConnectComponent={walletConnectComponent}
                url={url}
                sellerUrl={sellerUrl}
                onOrderSelection={onSelectOrder}
                blockchain={blockchain}
                candyShop={candyShop}
                wallet={wallet}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>
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
