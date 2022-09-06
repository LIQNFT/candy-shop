import React, { useEffect, useState } from 'react';
import { Blockchain, CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
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
import { CommonChain, EthWallet, TransactionState } from '../../model';
import { handleError } from 'utils/ErrorHandler';
import { getDefaultExchange, getExchangeInfo } from 'utils/getExchangeInfo';

import './style.less';
import { Price } from 'components/Price';

interface OrderDetailType<C, S, W> extends CommonChain<C, S, W> {
  tokenMint: string;
  backUrl?: string;
  walletConnectComponent: React.ReactElement;
  // wallet: AnchorWallet | undefined;
  // candyShop: CandyShop;
  sellerUrl?: string;
}
type OrderDetailProps =
  | OrderDetailType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | OrderDetailType<Blockchain.Solana, CandyShop, AnchorWallet>;

export const OrderDetail: React.FC<OrderDetailProps> = ({
  tokenMint,
  backUrl = '/',
  walletConnectComponent,
  sellerUrl,
  ...chainProps
}) => {
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const [loadingNftInfo, setLoadingNftInfo] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderSchema>();
  const [nftInfo, setNftInfo] = useState<Nft>();
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState('');

  const exchangeInfo =
    order && chainProps.blockchain === Blockchain.Solana
      ? getExchangeInfo(order, chainProps.candyShop)
      : getDefaultExchange(chainProps.candyShop);
  const publicKey = chainProps.wallet?.publicKey.toString();
  const isUserListing = publicKey && order && order.walletAddress === publicKey;

  useEffect(() => {
    if (!order) {
      setLoadingOrder(true);

      const getAction = (): Promise<any> => {
        switch (chainProps.blockchain) {
          case Blockchain.Solana:
            return chainProps.candyShop.activeOrderByMintAddress(tokenMint);
          default:
            return new Promise((res) => res(''));
        }
      };

      getAction()
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
      const getAction = (): any => {
        switch (chainProps.blockchain) {
          case Blockchain.Solana:
            return chainProps.candyShop.nftInfo(order.tokenMint);
          default:
            return new Promise((res) => res(''));
        }
      };
      getAction()
        .then((nft: Nft) => setNftInfo(nft))
        .catch((err: Error) => {
          console.info('fetchNftByMint failed:', err);
        })
        .finally(() => {
          setLoadingNftInfo(false);
        });
    }
  }, [order, nftInfo, tokenMint, chainProps.blockchain, chainProps.candyShop]);

  const buy = async () => {
    if (order && publicKey && chainProps.candyShop) {
      setState(TransactionState.PROCESSING);

      const getAction = (): any => {
        switch (chainProps.blockchain) {
          case Blockchain.Solana: {
            if (!chainProps.wallet?.publicKey) return;
            return chainProps.candyShop.buy({
              seller: new web3.PublicKey(order.walletAddress),
              tokenAccount: new web3.PublicKey(order.tokenAccount),
              tokenMint: new web3.PublicKey(order.tokenMint),
              price: new BN(order.price),
              wallet: chainProps.wallet
            });
          }
          default:
            return new Promise((res) => res(''));
        }
      };

      return getAction()
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
              <Price value={order?.price} {...chainProps} />
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
              {...chainProps}
            />
          ) : null}
          <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} />

          {!chainProps.wallet ? (
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
        {state === TransactionState.CONFIRMED && chainProps.wallet && order && (
          <Modal onCancel={goToMarketplace} width={600}>
            <div className="buy-modal">
              <BuyModalConfirmed
                order={order}
                txHash={hash}
                onClose={goToMarketplace}
                exchangeInfo={exchangeInfo}
                shopPriceDecimalsMin={chainProps.candyShop.priceDecimalsMin}
                shopPriceDecimals={chainProps.candyShop.priceDecimals}
                {...chainProps}
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
