import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CandyShopPay, CandyShopTrade, CandyShopTradeBuyParams, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema, PaymentCurrencyType, PaymentErrorName } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
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
  order: OrderSchema;
  onClose: () => void;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  candyShopProgramId: web3.PublicKey;
  connection: web3.Connection;
  isEnterprise: boolean;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  order,
  onClose,
  wallet,
  walletConnectComponent,
  exchangeInfo,
  connection,
  isEnterprise,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl
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

  const shopAddress = useMemo(
    () =>
      getCandyShopSync(
        new web3.PublicKey(order.candyShopCreatorAddress),
        new web3.PublicKey(order.treasuryMint),
        new web3.PublicKey(order.programId)
      )[0].toString(),
    [order]
  );

  const buy = async () => {
    if (!wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    setState(BuyModalState.PROCESSING);

    const tradeBuyParams: CandyShopTradeBuyParams = {
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: wallet,
      seller: new web3.PublicKey(order.walletAddress),
      connection: connection,
      shopAddress: new web3.PublicKey(shopAddress),
      candyShopProgramId: new web3.PublicKey(order.programId),
      isEnterprise: isEnterprise,
      shopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress),
      shopTreasuryMint: new web3.PublicKey(order.treasuryMint)
    };

    return CandyShopTrade.buy(tradeBuyParams)
      .then((txHash: string) => {
        setHash(txHash);
        console.log('Buy order made with transaction hash', txHash);
        setState(BuyModalState.CONFIRMED);
      })
      .catch((err: Error) => {
        console.log({ err });
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
    if (type === BuyModalState.PAYMENT) setState(BuyModalState.PAYMENT);
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
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            sellerUrl={sellerUrl}
            onPayment={onPaymentCallback}
            paymentPrice={paymentPrice}
            creditCardPayAvailable={creditCardPayAvailable}
            setCountdownElement={setCountdownElement}
          />
        )}
        {state === BuyModalState.PROCESSING && <Processing text={processingText} />}
        {(state === BuyModalState.CONFIRMED || state === BuyModalState.PAYMENT_ERROR) && wallet && (
          <BuyModalConfirmed
            walletPublicKey={wallet.publicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            paymentPrice={paymentPrice}
            error={paymentError}
          />
        )}

        {state === BuyModalState.PAYMENT && stripePublicKey && wallet?.publicKey && order && paymentPrice && (
          <StripePayment
            stripePublicKey={stripePublicKey}
            shopAddress={shopAddress}
            walletAddress={wallet.publicKey.toString()}
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
