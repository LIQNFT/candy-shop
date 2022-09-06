import React, { useState } from 'react';
import { Order as OrderComponent } from 'components/Order';
import { Order } from '@liqnft/candy-shop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Blockchain, CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { getDefaultExchange, getExchangeInfo } from 'utils/getExchangeInfo';
import { BuyModal } from 'components/BuyModal';
import { CancelModal } from 'components/CancelModal';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { CommonChain, EthWallet } from '../../model';
import { isSolana } from 'utils/helperFunc';

interface InfiniteOrderListType<C, S, W> extends CommonChain<C, S, W> {
  orders: Order[];
  walletConnectComponent: React.ReactElement;
  url?: string;
  hasNextPage: boolean;
  loadNextPage: () => void;
  sellerUrl?: string;
}
type InfiniteOrderListProps =
  | InfiniteOrderListType<Blockchain.Solana, CandyShop, AnchorWallet>
  | InfiniteOrderListType<Blockchain.Ethereum, EthCandyShop, EthWallet>;

export const InfiniteOrderList: React.FC<InfiniteOrderListProps> = ({
  orders,
  walletConnectComponent,
  url,
  hasNextPage,
  loadNextPage,
  sellerUrl,
  ...chainProps
}) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderSchema>();
  const onSelectOrder = (order?: OrderSchema) => setSelectedOrder(order);

  const exchangeInfo =
    chainProps.blockchain === Blockchain.Solana
      ? getExchangeInfo(selectedOrder, chainProps.candyShop)
      : getDefaultExchange(chainProps.candyShop);
  const isUserListing =
    selectedOrder &&
    chainProps.wallet?.publicKey &&
    selectedOrder.walletAddress === chainProps.wallet.publicKey.toString();

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
                {...chainProps}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>
      {selectedOrder && !isUserListing ? (
        <BuyModal
          order={selectedOrder}
          onClose={() => onSelectOrder(undefined)}
          exchangeInfo={exchangeInfo}
          connection={chainProps.blockchain === Blockchain.Solana ? chainProps.candyShop.connection() : undefined}
          isEnterprise={chainProps.blockchain === Blockchain.Solana ? chainProps.candyShop.isEnterprise : false}
          shopPriceDecimalsMin={chainProps.blockchain === Blockchain.Solana ? chainProps.candyShop.priceDecimalsMin : 0}
          shopPriceDecimals={chainProps.blockchain === Blockchain.Solana ? chainProps.candyShop.priceDecimals : 0}
          sellerUrl={sellerUrl}
          walletConnectComponent={walletConnectComponent}
          {...chainProps}
        />
      ) : null}
      {selectedOrder && isUserListing && chainProps.wallet ? (
        <CancelModal
          onClose={() => onSelectOrder(undefined)}
          order={selectedOrder}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={isSolana(chainProps.blockchain) ? chainProps.candyShop.priceDecimalsMin : 0}
          shopPriceDecimals={isSolana(chainProps.blockchain) ? chainProps.candyShop.priceDecimals : 0}
          {...chainProps}
        />
      ) : null}
    </>
  );
};
