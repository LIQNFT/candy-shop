import React, { useEffect, useState } from 'react';
import { ExplorerLinkBase, fetchNFTByMintAddress } from '@liqnft/candy-shop-sdk';
import { Blockchain, Nft, Order as OrderSchema } from '@liqnft/candy-shop-types';

import { NftAttributes } from 'components/NftAttributes';
import { NftStat } from 'components/NftStat';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { Viewer } from 'components/Viewer';

import { CreditCardPayAvailability, ShopExchangeInfo } from 'model';
import { getPrice } from 'utils/getPrice';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';

const Logger = 'CandyShopUI/BuyModalDetail';

export interface BuyModalDetailProps {
  publicKey: string | undefined;
  order: OrderSchema;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
  setCountdownElement: React.Dispatch<React.SetStateAction<null | HTMLSpanElement>>;
  paymentPrice?: number;
  creditCardPayAvailable: CreditCardPayAvailability;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
  buy: () => void;
  onPayment: () => void;
}

export const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  publicKey,
  order,
  walletConnectComponent,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl,
  setCountdownElement,
  paymentPrice,
  creditCardPayAvailable,
  explorerLink,
  candyShopEnv,
  buy,
  onPayment
}) => {
  const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  const [nftInfo, setNftInfo] = useState<Nft>();

  const timeoutRef = useUnmountTimeout();

  useEffect(() => {
    setLoadingNftInfo(true);
    fetchNFTByMintAddress(order.tokenMint)
      .then((nft: Nft) => setNftInfo(nft))
      .catch((err: Error) => {
        console.info(`${Logger}: fetchNFTByMintAddress failed:`, err);
      })
      .finally(() => {
        setLoadingNftInfo(false);
      });
  }, [order.tokenMint]);

  const onBuyWithCreditCard = () => {
    if (creditCardPayAvailable === CreditCardPayAvailability.Unsupported) return;
    timeoutRef.current && clearTimeout(timeoutRef.current);
    onPayment();
  };

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order.price, exchangeInfo);

  return (
    <>
      <div className="candy-buy-modal-thumbnail">
        <Viewer order={order} />
      </div>
      <div className="candy-buy-modal-container">
        <div className="candy-buy-modal-title">
          {order?.name}
          {order.verifiedNftCollection ? <NftVerification size={24} /> : null}
        </div>
        <div className="candy-buy-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <div className="candy-price">
              {orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}
              <span className="candy-price-timeout">
                {paymentPrice ? (
                  <>
                    <span className="candy-price-usd">&nbsp; US${paymentPrice}</span>
                    <span ref={setCountdownElement} id="stripe-timeout">
                      (3s)
                    </span>
                  </>
                ) : null}
              </span>
            </div>
          </div>
          {publicKey ? (
            <div>
              <button className="candy-button candy-buy-modal-button" onClick={buy}>
                Buy Now
              </button>

              {creditCardPayAvailable !== CreditCardPayAvailability.Unsupported && (
                <button
                  className={`candy-button candy-pay-credit-button ${
                    creditCardPayAvailable !== CreditCardPayAvailability.Disabled && paymentPrice ? '' : 'disabled'
                  }`}
                  onClick={onBuyWithCreditCard}
                >
                  Buy with Credit Card
                </button>
              )}
            </div>
          ) : (
            walletConnectComponent
          )}
        </div>
        {order.nftDescription && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order?.nftDescription}</div>
          </div>
        )}
        <NftStat
          owner={order.walletAddress}
          tokenMint={order.tokenMint}
          edition={order.edition}
          sellerUrl={sellerUrl}
          candyShopEnv={candyShopEnv}
          explorerLink={explorerLink}
        />
        <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} />
      </div>
    </>
  );
};
