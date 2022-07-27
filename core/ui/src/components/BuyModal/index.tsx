import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CandyShopPay, CandyShopTrade, CandyShopTradeBuyParams, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema, PaymentCurrencyType, SingleBase } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { StripePayment } from 'components/Payment';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import { useCandyShopPayContext } from 'contexts/CandyShopPayProvider';
import { ShopExchangeInfo, BuyModalState, PaymentErrorDetails } from 'model';
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
  candyShop: CandyShop;
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
  sellerUrl,
  candyShop
}) => {
  const [state, setState] = useState<BuyModalState>(BuyModalState.DISPLAY);
  const [hash, setHash] = useState(''); // txHash
  const [processingText, setProcessingText] = useState<ProcessingTextType>(ProcessingTextType.General);
  const [paymentPrice, setPaymentPrice] = useState<number>();
  const [paymentError, setPaymentError] = useState<PaymentErrorDetails>();
  const [creditCardPayAvailable, setCreditCardPayAvailable] = useState<boolean>();
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

  const getFiatMoneyPrice = useCallback(() => {
    return CandyShopPay.getTokenFiatMoneyPrice(
      { shopId: shopAddress, tokenAccount: order.tokenAccount },
      { quoteCurrencyType: PaymentCurrencyType.USD }
    )
      .then((res: SingleBase<string>) => {
        if (res.success) {
          setPaymentPrice(Number(res.result));
        } else {
          console.log(`${Logger}: getTokenFiatMoneyPrice failed: `, res);
          res.msg && notification(res.msg, NotificationType.Error);
          setPaymentPrice(0);
        }
      })
      .catch((err: Error) => {
        console.log(`${Logger}: getTokenFiatMoneyPrice failed: `, err);
        notification(err.message, NotificationType.Error);
        setPaymentPrice(0);
      });
  }, [order.tokenAccount, shopAddress]);

  const getFiatPriceAndUpdateCountDownElement = useCallback(
    (countdownElement: HTMLElement, time: number) => {
      timeoutFetchPrice.current = setTimeout(() => {
        countdownElement.innerText = `(${time.toString()}s)`;
        if (time === 0) {
          getFiatMoneyPrice().then(() => {
            time = 3;
            getFiatPriceAndUpdateCountDownElement(countdownElement, time);
          });
        } else {
          time--;
          getFiatPriceAndUpdateCountDownElement(countdownElement, time);
        }
      }, 1000);
    },
    [getFiatMoneyPrice]
  );

  // handle interval get token price
  useEffect(() => {
    if (!countdownElement) return;
    getFiatPriceAndUpdateCountDownElement(countdownElement, 2);

    return () => {
      timeoutFetchPrice.current && clearTimeout(timeoutFetchPrice.current);
    };
  }, [countdownElement, getFiatMoneyPrice, getFiatPriceAndUpdateCountDownElement]);

  useEffect(() => {
    getFiatMoneyPrice();
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
  }, [getFiatMoneyPrice, order.name, order.tokenAccount, shopAddress]);

  const modalWidth = state === BuyModalState.DISPLAY || state === BuyModalState.PAYMENT ? 1000 : 600;

  if (paymentPrice === undefined || creditCardPayAvailable === undefined) {
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
            candyShop={candyShop}
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
            candyShop={candyShop}
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
