import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CandyShopPay, ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Blockchain, Order as OrderSchema, PaymentCurrencyType, PaymentErrorName } from '@liqnft/candy-shop-types';

import { Modal } from 'components/Modal';
import { StripePayment } from 'components/Payment';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import { useCandyShopPayContext } from 'contexts/CandyShopPayProvider';
import { ShopExchangeInfo, BuyModalState, PaymentErrorDetails, CreditCardPayAvailability } from 'model';
import { ErrorMsgMap, ErrorType, handleError } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { BuyModalConfirmed } from './BuyModalConfirmed';
import { BuyModalDetail } from './BuyModalDetail';

import './style.less';

enum ProcessingTextType {
  General = 'Processing purchase',
  CreditCard = 'Processing purchase, do not close the window...'
}

const Logger = 'CandyShopUI/BuyModalDetail';

export interface BuyModalProps {
  walletPublicKey: string | undefined;
  shopAddress: string;
  order: OrderSchema;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
  onClose: () => void;
  buyNft: (order: OrderSchema) => Promise<string>;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  walletPublicKey,
  shopAddress,
  order,
  walletConnectComponent,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl,
  candyShopEnv,
  explorerLink,
  onClose,
  buyNft
}) => {
  const [state, setState] = useState<BuyModalState>(BuyModalState.DISPLAY);
  const [hash, setHash] = useState(''); // txHash
  const [processingText, setProcessingText] = useState<ProcessingTextType>(ProcessingTextType.General);
  const [paymentPrice, setPaymentPrice] = useState<number>();
  const [paymentError, setPaymentError] = useState<PaymentErrorDetails>();
  const [creditCardPayAvailable, setCreditCardPayAvailable] = useState<CreditCardPayAvailability>();
  const [countdownElement, setCountdownElement] = useState<HTMLSpanElement | null>(null);
  const timeoutFetchPrice = useRef<NodeJS.Timeout>();

  const stripePublicKey = useCandyShopPayContext()?.stripePublicKey;

  const buy = async () => {
    if (!walletPublicKey) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    setState(BuyModalState.PROCESSING);

    buyNft(order)
      .then((txHash: string) => {
        setHash(txHash);
        console.log('Buy order made with transaction hash', txHash);
        setState(BuyModalState.CONFIRMED);
      })
      .catch((err: Error) => {
        console.log(`${Logger} buyNft failed, error=`, err);
        err.message = (err as any).code || err.message;
        handleError({ error: err });
        setState(BuyModalState.DISPLAY);
      });
  };

  const onProcessingPay = (type: BuyModalState, error: any) => {
    if (type === BuyModalState.PROCESSING) {
      setProcessingText(ProcessingTextType.CreditCard);
      setState(BuyModalState.PROCESSING);
      return;
    }
    if (type === BuyModalState.CONFIRMED) {
      setState(BuyModalState.CONFIRMED);
      return;
    }

    if (type === BuyModalState.PAYMENT_ERROR) {
      setState(BuyModalState.PAYMENT_ERROR);
      setPaymentError(error);
      return;
    }
    if (type === BuyModalState.PAYMENT) {
      setState(BuyModalState.PAYMENT);
    }
  };

  // Aggregate checkPaymentAvailability and getTokenFiatMoneyPrice
  const getPaymentDetail = useCallback(async () => {
    if (!stripePublicKey) {
      throw Error('Stripe public key is not provided');
    }
    // Prevent to fetch again when updating fiat price
    if (creditCardPayAvailable === undefined) {
      const paymentAvailableRes = await CandyShopPay.checkPaymentAvailability({
        shopId: shopAddress,
        tokenAccount: order.tokenAccount
      });
      // Throw Error to caller if failed
      if (!paymentAvailableRes.success) {
        const error = new Error(paymentAvailableRes.msg);
        error.name = paymentAvailableRes.result;
        throw error;
      }
    }
    const fiatPriceRes = await CandyShopPay.getTokenFiatMoneyPrice(
      { shopId: shopAddress, tokenAccount: order.tokenAccount },
      { quoteCurrencyType: PaymentCurrencyType.USD }
    );
    if (!fiatPriceRes.success) {
      throw Error(fiatPriceRes.msg);
    }
    return Number(fiatPriceRes.result);
  }, [shopAddress, order.tokenAccount, creditCardPayAvailable, stripePublicKey]);

  useEffect(() => {
    // Only fetch when haven't retrieved the creditCardPayAvailability
    if (creditCardPayAvailable === undefined) {
      getPaymentDetail()
        .then((fiatPrice: number) => {
          setPaymentPrice(fiatPrice);
          setCreditCardPayAvailable(CreditCardPayAvailability.Supported);
        })
        .catch((error: Error) => {
          console.log(
            `${Logger}: getPaymentDetail failed, token= ${order.name} ${order.tokenAccount}, reason=`,
            error.message
          );
          if (error.name === PaymentErrorName.InsufficientPurchaseBalance) {
            setCreditCardPayAvailable(CreditCardPayAvailability.Disabled);
            notification(error.message, NotificationType.Error);
            return;
          }
          if (error.name === PaymentErrorName.BelowMinPurchasePrice) {
            setCreditCardPayAvailable(CreditCardPayAvailability.Disabled);
            notification(error.message, NotificationType.Error);
            return;
          }
          setCreditCardPayAvailable(CreditCardPayAvailability.Unsupported);
        });
    }
  }, [order.name, order.tokenAccount, getPaymentDetail, creditCardPayAvailable, stripePublicKey]);

  const getFiatPriceAndUpdateCountDownElement = useCallback(
    (countdownElement: HTMLElement, time: number) => {
      timeoutFetchPrice.current = setTimeout(() => {
        countdownElement.innerText = `(${time.toString()}s)`;
        if (time === 0) {
          getPaymentDetail().then((fiatPrice: number) => {
            setPaymentPrice(fiatPrice);
            time = 3;
            getFiatPriceAndUpdateCountDownElement(countdownElement, time);
          });
        } else {
          time--;
          getFiatPriceAndUpdateCountDownElement(countdownElement, time);
        }
      }, 1000);
    },
    [getPaymentDetail]
  );
  // handle interval get token price
  useEffect(() => {
    if (!countdownElement) return;
    getFiatPriceAndUpdateCountDownElement(countdownElement, 2);

    return () => {
      timeoutFetchPrice.current && clearTimeout(timeoutFetchPrice.current);
    };
  }, [
    creditCardPayAvailable,
    shopAddress,
    order.tokenAccount,
    countdownElement,
    getFiatPriceAndUpdateCountDownElement
  ]);

  const modalWidth = state === BuyModalState.DISPLAY || state === BuyModalState.PAYMENT ? 1000 : 600;

  // Only shows the loading when key is available to determine credit card payment
  if (creditCardPayAvailable === undefined) {
    return (
      <Modal className="candy-buy-modal-container" onCancel={onClose} width={1000}>
        <div className="candy-buy-modal">
          <Processing />
        </div>
      </Modal>
    );
  }

  const onPaymentCallback = () => {
    timeoutFetchPrice.current && clearTimeout(timeoutFetchPrice.current);
    setState(BuyModalState.PAYMENT);
  };

  return (
    <Modal
      className="candy-buy-modal-container"
      onCancel={onClose}
      width={modalWidth}
      closeOnClickOutside={state !== BuyModalState.PAYMENT_ERROR}
    >
      <div className="candy-buy-modal">
        {state === BuyModalState.DISPLAY && (
          <BuyModalDetail
            order={order}
            buy={buy}
            walletConnectComponent={walletConnectComponent}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            sellerUrl={sellerUrl}
            onPayment={onPaymentCallback}
            paymentPrice={paymentPrice}
            creditCardPayAvailable={creditCardPayAvailable}
            setCountdownElement={setCountdownElement}
            candyShopEnv={candyShopEnv}
            explorerLink={explorerLink}
            publicKey={walletPublicKey}
          />
        )}
        {state === BuyModalState.PROCESSING && <Processing text={processingText} />}
        {(state === BuyModalState.CONFIRMED || state === BuyModalState.PAYMENT_ERROR) && walletPublicKey && (
          <BuyModalConfirmed
            walletPublicKey={walletPublicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            paymentPrice={paymentPrice}
            error={paymentError}
            candyShopEnv={candyShopEnv}
            explorerLink={explorerLink}
          />
        )}

        {state === BuyModalState.PAYMENT && stripePublicKey && walletPublicKey && order && paymentPrice && (
          <StripePayment
            stripePublicKey={stripePublicKey}
            shopAddress={shopAddress}
            walletAddress={walletPublicKey}
            order={order}
            shopPriceDecimals={shopPriceDecimals}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            exchangeInfo={exchangeInfo}
            onProcessingPay={onProcessingPay}
            paymentPrice={paymentPrice}
          />
        )}
      </div>
      <PoweredByInBuyModal />
    </Modal>
  );
};
