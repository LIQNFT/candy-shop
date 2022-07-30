import React, { useCallback, useEffect, useState } from 'react';
import { CandyShop, CandyShopPay, fetchNFTByMintAddress, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Nft, Order as OrderSchema, SingleBase } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';

import { NftAttributes } from 'components/NftAttributes';
import { NftStat } from 'components/NftStat';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { Viewer } from 'components/Viewer';

import { CreditCardPayAvailability, ShopExchangeInfo } from 'model';
import { getPrice } from 'utils/getPrice';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';

const Logger = 'CandyShopUI/BuyModalDetail';

export interface BuyModalDetailProps {
  order: OrderSchema;
  buy: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
  candyShop: CandyShop;
  onPayment: () => void;
  setCountdownElement: React.Dispatch<React.SetStateAction<null | HTMLSpanElement>>;
  paymentPrice?: number;
  creditCardPayAvailable: CreditCardPayAvailability;
}

export const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl,
  candyShop,
  onPayment,
  setCountdownElement,
  paymentPrice,
  creditCardPayAvailable
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
                    <span className="candy-price-usd">&nbsp;| ${paymentPrice} USD</span>
                    <span ref={setCountdownElement} id="stripe-timeout">
                      (3s)
                    </span>
                  </>
                ) : null}
              </span>
            </div>
          </div>
          {walletPublicKey && (
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
          )}
          {!walletPublicKey && walletConnectComponent}
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
          candyShop={candyShop}
        />
        <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} />
      </div>
    </>
  );
};
