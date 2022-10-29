import React, { useEffect, useMemo, useState } from 'react';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Nft, Order as OrderSchema, SingleBase } from '@liqnft/candy-shop-types';

import { BuyModalConfirmed } from 'components/BuyModal/BuyModalConfirmed';
import { Modal } from 'components/Modal';
import { NftAttributes } from 'components/NftAttributes';
import { NftStat } from 'components/NftStat';
import { Processing } from 'components/Processing';
import { Viewer } from 'components/Viewer';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { ShopProps, TransactionState } from '../../model';
import { handleError } from 'utils/ErrorHandler';
import { getDefaultExchange, getExchangeInfo } from 'utils/getExchangeInfo';
import { Price } from 'components/Price';
import { StoreProvider } from 'market';

import './style.less';

interface OrderDetailProps extends ShopProps {
  tokenMint: string;
  backUrl?: string;
  walletConnectComponent: React.ReactElement;
  sellerUrl?: string;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  tokenMint,
  backUrl = '/',
  walletConnectComponent,
  sellerUrl,
  candyShop,
  wallet
}) => {
  const store = useMemo(() => StoreProvider({ candyShop, wallet }), [candyShop, wallet]);

  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const [loadingNftInfo, setLoadingNftInfo] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderSchema>();
  const [nftInfo, setNftInfo] = useState<Nft>();
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState('');

  const exchangeInfo =
    order && candyShop instanceof CandyShop ? getExchangeInfo(order, candyShop) : getDefaultExchange(candyShop);
  const publicKey = wallet?.publicKey?.toString();
  const isUserListing = publicKey && order && order.walletAddress === publicKey;

  useEffect(() => {
    if (!order) {
      setLoadingOrder(true);

      store
        .getOrderNft(tokenMint)
        .then((res: SingleBase<OrderSchema>) => {
          if (!res.success) throw new Error('Order not found');
          setOrder(res.result);
        })
        .catch((err: Error) => {
          console.log('OrderDetail: activeOrderByMintAddress failed=', err);
        })
        .finally(() => {
          setLoadingOrder(false);
        });
      return;
    }

    if (order && !nftInfo) {
      setLoadingNftInfo(true);

      store
        .getNftInfo(order.tokenMint)
        .then((nft: Nft) => setNftInfo(nft))
        .catch((err: Error) => {
          console.info('fetchNftByMint failed:', err);
        })
        .finally(() => {
          setLoadingNftInfo(false);
        });
    }
  }, [order, nftInfo, tokenMint, candyShop, store]);

  const buy = async () => {
    if (order && publicKey && candyShop) {
      setState(TransactionState.PROCESSING);

      return store
        .buy(order)
        .then((txHash: any) => {
          setHash(txHash);
          console.log('Buy made with transaction hash', txHash);
          setState(TransactionState.CONFIRMED);
        })
        .catch((err: Error) => {
          console.log({ err });
          handleError({ error: err });
          setState(TransactionState.DISPLAY);
        });
    }
  };

  const goToMarketplace = () => {
    window.location.href = backUrl;
  };

  if (loadingOrder) return <div className="candy-loading" style={{ margin: '100px auto' }} />;

  return (
    <div className="candy-order-detail">
      <div className="candy-container">
        <div className="candy-order-detail-left">{order && <Viewer order={order} />}</div>
        <div className="candy-order-detail-right">
          {isUserListing && <div className="candy-status-tag-inline">Your Listing</div>}
          <div className="candy-order-detail-title">
            {order?.name}
            {order?.verifiedNftCollection ? <NftVerification size={24} /> : null}
          </div>
          <div className="candy-stat">
            <div className="candy-label">PRICE</div>
            <div className="candy-price">
              <Price
                value={order?.price}
                currencySymbol={candyShop.currencySymbol}
                baseUnitsPerCurrency={candyShop.baseUnitsPerCurrency}
                priceDecimalsMin={candyShop.priceDecimalsMin}
                priceDecimals={candyShop.priceDecimals}
              />
            </div>
          </div>
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order?.nftDescription}</div>
          </div>
          {order?.tokenMint ? (
            <NftStat
              owner={order.walletAddress}
              edition={order.edition}
              tokenMint={order.tokenMint}
              sellerUrl={sellerUrl}
              candyShopEnv={candyShop.env}
              explorerLink={candyShop.explorerLink}
            />
          ) : null}
          <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} />

          {!wallet ? (
            walletConnectComponent
          ) : (
            <button
              className="candy-button"
              onClick={buy}
              disabled={state === TransactionState.PROCESSING || state === TransactionState.CONFIRMED}
            >
              Buy Now
            </button>
          )}
        </div>
        {state === TransactionState.PROCESSING && (
          <Modal onCancel={() => setState(TransactionState.DISPLAY)} width={600}>
            <div className="buy-modal">
              <Processing text="Processing purchase" />
            </div>
          </Modal>
        )}
        {state === TransactionState.CONFIRMED && wallet && order && (
          <Modal onCancel={goToMarketplace} width={600}>
            <div className="buy-modal">
              <BuyModalConfirmed
                order={order}
                txHash={hash}
                onClose={goToMarketplace}
                exchangeInfo={exchangeInfo}
                shopPriceDecimalsMin={candyShop.priceDecimalsMin}
                shopPriceDecimals={candyShop.priceDecimals}
                walletPublicKey={wallet.publicKey?.toString()}
                candyShopEnv={candyShop.env}
                explorerLink={candyShop.explorerLink}
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
