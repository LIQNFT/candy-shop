import React, { useCallback, useEffect, useState } from 'react';
import { CandyShopPay, fetchNFTByMintAddress } from '@liqnft/candy-shop-sdk';
import { Nft, Order as OrderSchema, SingleBase } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';

import { NftAttributes } from 'components/NftAttributes';
import { NftStat } from 'components/NftStat';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { Viewer } from 'components/Viewer';

import { ShopExchangeInfo } from 'model';
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
  shopAddress: string;
  sellerUrl?: string;
  onPayment: () => void;
  setPaymentPrice: React.Dispatch<React.SetStateAction<number | undefined>>;
  paymentPrice?: number;
}

export const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  shopAddress,
  sellerUrl,
  onPayment,
  setPaymentPrice,
  paymentPrice
}) => {
  const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  const [nftInfo, setNftInfo] = useState<Nft>();

  const [creditCardPayAvailable, setCreditCardPayAvailable] = useState<boolean>(false);
  const [countdownElement, setCountdownElement] = useState<HTMLSpanElement | null>(null);

  const timeoutRef = useUnmountTimeout();

  const getCreditCardPayAvailability = useCallback(() => {
    CandyShopPay.checkPaymentAvailability({
      shopId: shopAddress,
      tokenAccount: order.tokenAccount
    })
      .then((res: SingleBase<string>) => {
        if (res.success) {
          setCreditCardPayAvailable(true);
        } else {
          console.log(
            `${Logger}: checkPaymentAvailability failed, token= ${order.name} ${order.tokenAccount}, reason=`,
            res.result
          );
          setCreditCardPayAvailable(false);
        }
      })
      .catch((err: Error) => {
        console.log(
          `${Logger}: checkPaymentAvailability failed, token= ${order.name} ${order.tokenAccount}, error=`,
          err
        );
        setCreditCardPayAvailable(false);
      });
  }, [shopAddress, order]);

  const getTokenPrice = useCallback(() => {
    return CandyShopPay.fetchTokenPrice({ shopId: shopAddress, tokenAccount: order.tokenAccount })
      .then((res) => {
        console.log('GET TOKEN PRICE');
        setPaymentPrice(Number(res.result));
      })
      .catch((err) => {
        console.log(`${Logger}: fetchTokenPrice failed: `, err);
      });
  }, [setPaymentPrice, order.tokenAccount, shopAddress]);

  useEffect(() => {
    setLoadingNftInfo(true);
    getCreditCardPayAvailability();
    fetchNFTByMintAddress(order.tokenMint)
      .then((nft) => setNftInfo(nft))
      .catch((err) => {
        console.info(`${Logger}: fetchNFTByMintAddress failed:`, err);
      })
      .finally(() => {
        setLoadingNftInfo(false);
      });
  }, [order.tokenMint, getCreditCardPayAvailability]);

  useEffect(() => {
    if (!creditCardPayAvailable) return;
    getTokenPrice();

    if (!countdownElement) return;
    let time = 2;
    const callback = () => {
      timeoutRef.current = setTimeout(() => {
        countdownElement.innerText = `(${time.toString()}s)`;
        if (time === 0) {
          getTokenPrice().then(() => {
            time = 3;
            callback();
          });
        } else {
          callback();
          time--;
        }
      }, 1000);
    };
    callback();
  }, [countdownElement, creditCardPayAvailable, getTokenPrice, timeoutRef]);

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order, exchangeInfo);

  const onBuyWithCreditCard = () => {
    if (!creditCardPayAvailable) return;
    timeoutRef.current && clearTimeout(timeoutRef.current);
    onPayment();
  };

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
                {creditCardPayAvailable && paymentPrice ? (
                  <>
                    <span className="candy-price-usd">&nbsp;| ${paymentPrice} USD</span>
                    <span ref={(ref) => setCountdownElement(ref)} id="stripe-timeout">
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

              <button
                className={`candy-button candy-pay-credit-button ${
                  creditCardPayAvailable && paymentPrice ? '' : 'disabled'
                }`}
                onClick={onBuyWithCreditCard}
              >
                Buy with Credit Card
              </button>
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
        />
        <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} />
      </div>
    </>
  );
};
