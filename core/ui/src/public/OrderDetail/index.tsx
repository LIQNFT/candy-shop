import React, { useEffect, useMemo, useState } from 'react';
import { web3, BN } from '@project-serum/anchor';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { ExplorerLink } from 'components/ExplorerLink';
import { NftAttributes } from 'components/NftAttributes';
import { LiqImage } from 'components/LiqImage';
import Modal from 'components/Modal';
import Processing from 'components/Processing';
import BuyModalConfirmed from 'components/BuyModal/BuyModalConfirmed';

import { ErrorType, handleError } from 'utils/ErrorHandler';
import { Nft, Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { TransactionState } from 'model';
import './style.less';

interface OrderDetailProps {
  tokenMint: string;
  backUrl?: string;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  wallet: AnchorWallet | undefined;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  tokenMint,
  backUrl = '/',
  candyShop,
  walletConnectComponent,
  wallet
}) => {
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  const [order, setOrder] = useState<OrderSchema>();
  const [nftInfo, setNftInfo] = useState<Nft>();

  const [state, setState] = useState<TransactionState>(
    TransactionState.DISPLAY
  );
  const [hash, setHash] = useState('');

  const orderPrice = useMemo(() => {
    try {
      return (
        Number(order?.price) / candyShop.baseUnitsPerCurrency
      ).toLocaleString(undefined, {
        minimumFractionDigits: candyShop.priceDecimals,
        maximumFractionDigits: candyShop.priceDecimals
      });
    } catch (err) {
      return null;
    }
  }, [candyShop.baseUnitsPerCurrency, candyShop.priceDecimals, order?.price]);

  const isUserListing =
    wallet?.publicKey &&
    order &&
    order.walletAddress === wallet.publicKey.toString();

  useEffect(() => {
    if (!order) {
      setLoadingOrder(true);
      candyShop
        .activeOrderByMintAddress(tokenMint)
        .then((res) => {
          if (!res.success) throw new Error('Order not found');
          setOrder(res.result);
        })
        .catch((err) => {
          console.info('activeOrderByMintAddress failed:', err);
        })
        .finally(() => {
          setLoadingOrder(false);
        });
    }

    if (order && !nftInfo) {
      setLoadingNftInfo(true);
      candyShop
        .nftInfo(order.tokenMint)
        .then((nft) => setNftInfo(nft))
        .catch((err) => {
          console.info('fetchNftByMint failed:', err);
        })
        .finally(() => {
          setLoadingNftInfo(false);
        });
    }
  }, [order, candyShop, nftInfo, tokenMint]);

  const buy = async () => {
    if (order && wallet) {
      setState(TransactionState.PROCESSING);
      return candyShop
        .buy(
          new web3.PublicKey(order.walletAddress),
          new web3.PublicKey(order.tokenAccount),
          new web3.PublicKey(order.tokenMint),
          new BN(order.price),
          wallet
        )
        .then((txHash) => {
          setHash(txHash);
          console.log('Buy made with transaction hash', txHash);
          setState(TransactionState.CONFIRMED);
        })
        .catch((err) => {
          console.log({ err });
          handleError(ErrorType.TransactionFailed);
          setState(TransactionState.DISPLAY);
        });
    }
  };

  const goToMarketplace = () => {
    window.location.href = backUrl;
  };

  if (loadingOrder)
    return <div className="candy-loading" style={{ margin: '100px auto' }} />;

  return (
    <div className="candy-order-detail">
      <div className="candy-container">
        <div className="candy-order-detail-left">
          <LiqImage
            src={order?.nftImageLink || ''}
            alt={order?.name}
            fit="contain"
          />
        </div>
        <div className="candy-order-detail-right">
          {isUserListing && (
            <div className="candy-status-tag-inline">Your Listing</div>
          )}
          <div className="candy-order-detail-title">{order?.name}</div>
          <div className="candy-stat">
            <div className="candy-label">PRICE</div>
            <div className="candy-price">
              {orderPrice ? `${orderPrice} ${candyShop.currencySymbol}` : 'N/A'}
            </div>
          </div>
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order?.nftDescription}</div>
          </div>
          <div className="candy-stat-horizontal">
            <div>
              <div className="candy-label">MINT ADDRESS</div>
              <div className="candy-value">
                <ExplorerLink type="address" address={order?.tokenMint || ''} />
              </div>
            </div>
            <div className="candy-stat-horizontal-line" />
            {order?.edition ? (
              <>
                <div>
                  <div className="candy-label">EDITION</div>
                  <div className="candy-value">{order?.edition}</div>
                </div>
                <div className="candy-stat-horizontal-line" />
              </>
            ) : null}
            <div>
              <div className="candy-label">OWNER</div>
              <div className="candy-value">
                <ExplorerLink
                  type="address"
                  address={order?.walletAddress || ''}
                />
              </div>
            </div>
          </div>
          <NftAttributes
            loading={loadingNftInfo}
            attributes={nftInfo?.attributes}
          />

          {!wallet ? (
            walletConnectComponent
          ) : (
            <button
              className="candy-button"
              onClick={buy}
              disabled={
                state === TransactionState.PROCESSING ||
                state === TransactionState.CONFIRMED
              }
            >
              Buy Now
            </button>
          )}
        </div>
        {state === TransactionState.PROCESSING && (
          <Modal
            onCancel={() => setState(TransactionState.DISPLAY)}
            width={600}
          >
            <div className="buy-modal">
              <Processing text="Processing purchase" />
            </div>
          </Modal>
        )}
        {state === TransactionState.CONFIRMED && wallet && (
          <Modal onCancel={goToMarketplace} width={600}>
            <div className="buy-modal">
              <BuyModalConfirmed
                walletPublicKey={wallet.publicKey}
                order={order}
                txHash={hash}
                candyShop={candyShop}
                onClose={goToMarketplace}
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
