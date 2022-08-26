import React, { useEffect, useState } from 'react';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Nft, Order as OrderSchema, SingleBase } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { BuyModalConfirmed } from 'components/BuyModal/BuyModalConfirmed';
import { Modal } from 'components/Modal';
import { NftAttributes } from 'components/NftAttributes';
import { NftStat } from 'components/NftStat';
import { Processing } from 'components/Processing';
import { Viewer } from 'components/Viewer';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { TransactionState } from 'model';
import { handleError } from 'utils/ErrorHandler';
import { getExchangeInfo } from 'utils/getExchangeInfo';

import './style.less';
import { Price } from 'components/Price';

interface OrderDetailProps {
  tokenMint: string;
  backUrl?: string;
  walletConnectComponent: React.ReactElement;
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  sellerUrl?: string;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  tokenMint,
  backUrl = '/',
  walletConnectComponent,
  wallet,
  candyShop,
  sellerUrl
}) => {
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const [loadingNftInfo, setLoadingNftInfo] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderSchema>();
  const [nftInfo, setNftInfo] = useState<Nft>();
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState('');

  const exchangeInfo = order
    ? getExchangeInfo(order, candyShop)
    : {
        symbol: candyShop.currencySymbol,
        decimals: candyShop.currencyDecimals
      };
  const isUserListing = wallet?.publicKey && order && order.walletAddress === wallet.publicKey.toString();

  useEffect(() => {
    if (!order) {
      setLoadingOrder(true);
      candyShop
        .activeOrderByMintAddress(tokenMint)
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
      candyShop
        .nftInfo(order.tokenMint)
        .then((nft: Nft) => setNftInfo(nft))
        .catch((err: Error) => {
          console.info('fetchNftByMint failed:', err);
        })
        .finally(() => {
          setLoadingNftInfo(false);
        });
    }
  }, [order, candyShop, nftInfo, tokenMint]);

  const buy = async () => {
    if (order && wallet && candyShop) {
      setState(TransactionState.PROCESSING);
      return candyShop
        .buy({
          seller: new web3.PublicKey(order.walletAddress),
          tokenAccount: new web3.PublicKey(order.tokenAccount),
          tokenMint: new web3.PublicKey(order.tokenMint),
          price: new BN(order.price),
          wallet
        })
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
              <Price candyShop={candyShop} value={order?.price} />
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
              candyShop={candyShop}
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
                walletPublicKey={wallet.publicKey}
                order={order}
                txHash={hash}
                onClose={goToMarketplace}
                exchangeInfo={exchangeInfo}
                shopPriceDecimalsMin={candyShop.priceDecimalsMin}
                shopPriceDecimals={candyShop.priceDecimals}
                candyShop={candyShop}
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
