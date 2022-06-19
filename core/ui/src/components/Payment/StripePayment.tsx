import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  ConfirmStripePaymentParams,
  CreatePaymentParams,
  Order,
  PaymentCurrencyType,
  PaymentIntentInfo,
  PaymentMethodType,
  SingleBase
} from '@liqnft/candy-shop-types';
import { CandyShopPay } from '@liqnft/candy-shop-sdk';
import { StripeCardDetail } from './StripeCardDetail';
import { NFTPaymentStatus } from 'model';
import { useCallback } from 'react';
import { notification, NotificationType } from 'utils/rc-notification';
import { Processing } from 'components/Processing';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { TIMEOUT_EXTRA_LOADING } from 'constant';

const Logger = 'CandyShopUI/StripePayment';

interface StripePaymentProps {
  stripePublicKey: string;
  shopProgramId: string;
  shopAddress: string;
  walletAddress: string;
  order: Order;
}

export const StripePayment: React.FC<StripePaymentProps> = ({
  stripePublicKey,
  shopProgramId,
  shopAddress,
  walletAddress,
  order
}) => {
  const stripePromise = loadStripe(stripePublicKey);
  const [paymentId, setPaymentId] = useState<string>();
  const [nftPaymentStatus, setNFTPaymentStatus] = useState<NFTPaymentStatus>();
  const [failReason, setFailReason] = useState<string>();
  // TODO: Backend needs to provide an API to get USD currencyAmount from current order's price
  const [currencyAmount, setCurrencyAmount] = useState<number>(500);

  const timeoutRef = useUnmountTimeout();

  const initCardPayment = useCallback(() => {
    const params: CreatePaymentParams = {
      shopProgramId: shopProgramId,
      shopId: shopAddress,
      shopCreatorAddress: order.candyShopCreatorAddress,
      buyerWalletAddress: walletAddress,
      tokenAccount: order.tokenAccount,
      methodType: PaymentMethodType.CARD,
      currency: PaymentCurrencyType.USD,
      currencyAmount: currencyAmount
    };
    CandyShopPay.createPayment(params)
      .then((res: SingleBase<PaymentIntentInfo>) => {
        if (res.success && res.result) {
          console.log(`${Logger}: createPayment success, res=`, res.result);
          setPaymentId(res.result.paymentId);
          setNFTPaymentStatus(NFTPaymentStatus.Init);
        } else {
          console.log(`${Logger}: createPayment failed, reason=`, res.msg);
          if (res.msg) {
            notification(res.msg, NotificationType.Error, 5);
          }
        }
      })
      .catch((err: Error) => {
        console.error(`${Logger}: createPayment failed, error=`, err);
        notification(err.message, NotificationType.Error, 5);
      });
  }, [shopProgramId, shopAddress, walletAddress, order, currencyAmount]);

  useEffect(() => {
    if (nftPaymentStatus === undefined) {
      initCardPayment();
    }
  }, [nftPaymentStatus, initCardPayment]);

  const onCancelPayment = () => {
    console.log('debugger: closing StripePayment');
  };

  const onClickedPay = (params: ConfirmStripePaymentParams) => {
    setNFTPaymentStatus(NFTPaymentStatus.Processing);
    CandyShopPay.confirmPayment(params)
      .then((res: SingleBase<PaymentIntentInfo>) => {
        console.log('debugger: confirmPayment res=', res);
        if (res.success && res.result) {
          timeoutRef.current = setTimeout(() => {
            setNFTPaymentStatus(NFTPaymentStatus.Succeed);
          }, TIMEOUT_EXTRA_LOADING);
          console.log(`${Logger}: confirmPayment success=`, res.result);
        } else {
          setNFTPaymentStatus(NFTPaymentStatus.Failed);
          console.log(`${Logger}: confirmPayment failed, reason=`, res.msg);
          if (res.msg) {
            setFailReason(res.msg);
            notification(res.msg, NotificationType.Error, 5);
          }
        }
      })
      .catch((err: Error) => {
        setNFTPaymentStatus(NFTPaymentStatus.Failed);
        setFailReason(err.message);
        console.log(`${Logger}: handleCreatePayment failed, err=`, err);
        notification(err.message, NotificationType.Error, 5);
      });
  };

  return (
    <>
      {nftPaymentStatus === NFTPaymentStatus.Init && paymentId && (
        <Elements stripe={stripePromise}>
          <StripeCardDetail
            paymentId={paymentId}
            shopAddress={shopAddress}
            tokenAccount={order.tokenAccount}
            onClickedPayCallback={onClickedPay}
          ></StripeCardDetail>
        </Elements>
      )}
      {nftPaymentStatus === NFTPaymentStatus.Processing && <Processing text="Processing credit card payment" />}
      {nftPaymentStatus === NFTPaymentStatus.Succeed && <div>Credit Card Confirmed</div>}
      {nftPaymentStatus === NFTPaymentStatus.Failed && (
        <div>
          <div>Payment Failed</div>
          {failReason && <div> Reason: {failReason} </div>}
        </div>
      )}
      <div>Payment Status: {nftPaymentStatus}</div>
    </>
  );
};
