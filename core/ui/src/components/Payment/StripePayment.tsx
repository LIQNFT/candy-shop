import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  ConfirmStripePaymentParams,
  CreatePaymentParams,
  Order,
  PaymentCurrencyType,
  PaymentInfo,
  PaymentMethodType,
  ShopStatusType,
  SingleBase
} from '@liqnft/candy-shop-types';
import { CandyShopPay, safeAwait } from '@liqnft/candy-shop-sdk';
import { StripeCardDetail } from './StripeCardDetail';
import { Processing } from 'components/Processing';
import { Viewer } from 'components/Viewer';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { ShopExchangeInfo, BuyModalState, PaymentErrorDetails } from 'model';
import { notification, NotificationType } from 'utils/rc-notification';
import { getPrice } from 'utils/getPrice';
import { useUpdateCandyShopContext } from 'public/Context/CandyShopDataValidator';
import stripeLogo from '../../assets/stripe.png';

const Logger = 'CandyShopUI/StripePayment';

interface StripePaymentProps {
  stripePublicKey: string;
  shopAddress: string;
  walletAddress: string;
  order: Order;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  paymentPrice: number;
  onProcessingPay: (type: BuyModalState, error?: PaymentErrorDetails) => void;
}

export const StripePayment: React.FC<StripePaymentProps> = ({
  stripePublicKey,
  shopAddress,
  walletAddress,
  order,
  shopPriceDecimals,
  shopPriceDecimalsMin,
  exchangeInfo,
  onProcessingPay,
  paymentPrice
}) => {
  const stripePromise = loadStripe(stripePublicKey);
  const [paymentEntityId, setPaymentEntityId] = useState<string>();

  const { refreshSubject } = useUpdateCandyShopContext();

  useEffect(() => {
    const params: CreatePaymentParams = {
      shopProgramId: order.programId,
      shopId: shopAddress,
      shopCreatorAddress: order.candyShopCreatorAddress,
      buyerWalletAddress: walletAddress,
      tokenAccount: order.tokenAccount,
      methodType: PaymentMethodType.CARD,
      currency: PaymentCurrencyType.USD,
      currencyAmount: paymentPrice
    };
    // init payment with Stripe
    CandyShopPay.createPayment(params)
      .then((res: SingleBase<PaymentInfo>) => {
        if (res.success && res.result) {
          console.log(`${Logger}: createPayment success, res=`, res.result);
          setPaymentEntityId(res.result.paymentEntityId);
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
  }, [order, paymentPrice, shopAddress, walletAddress]);

  const handleConfirmPayment = async (params: ConfirmStripePaymentParams, stripe?: Stripe): Promise<boolean> => {
    onProcessingPay(BuyModalState.PROCESSING);
    const confirmRes = await CandyShopPay.confirmPayment(params);
    if (confirmRes.success && confirmRes.result) {
      const paymentInfo = confirmRes.result;
      const stripeInfo = paymentInfo.stripeConfirmInfo;
      if (stripe && stripeInfo?.requiresAuth && stripeInfo?.paymentIntentClientSecret) {
        // TODO: This might be different with production mode, should revisit when doing production test.
        // In test mode, the response contains `stripe_js` that has the authentication test page from Stripe
        if ('stripe_js' in stripeInfo.stripeSdkObj) {
          window.open(stripeInfo.stripeSdkObj.stripe_js, '_blank');
        } else {
          const handleAuth = await safeAwait(stripe.handleCardAction(stripeInfo.paymentIntentClientSecret));
          if (handleAuth.error) {
            // Catch the unexpected error of stripe.handleCardAction
            //console.log('debugger: paymentResult.error=', handleAuth.error);
          }

          if (handleAuth.result?.error) {
            throw handleAuth.result?.error;
          }
        }
        handleConfirmPayment(params);
        return false;
      } else {
        onProcessingPay(BuyModalState.CONFIRMED);
        refreshSubject(ShopStatusType.UserNft, Date.now());
      }
    } else if ('errorDetails' in confirmRes) {
      onProcessingPay(BuyModalState.PAYMENT_ERROR, (confirmRes as any).errorDetails);
    } else if (typeof confirmRes.result === 'string' && confirmRes.msg) {
      console.log(`${Logger}: confirmPayment failed, reason=`, confirmRes.msg);
      const errorDetails: PaymentErrorDetails = {
        title: confirmRes.result,
        content: confirmRes.msg
      };
      onProcessingPay(BuyModalState.PAYMENT_ERROR, errorDetails);
      notification(confirmRes.msg, NotificationType.Error, 5);
    }
    return true;
  };

  const onClickedPayCallback = (params: ConfirmStripePaymentParams, stripe: Stripe) => {
    handleConfirmPayment(params, stripe)
      .then((result) => {
        //console.log('debugger: result=', result);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: handleConfirmPayment failed, err=`, err);
        const errorDetails: PaymentErrorDetails = {
          title: err.name,
          content: err.message
        };
        onProcessingPay(BuyModalState.PAYMENT_ERROR, errorDetails);
        notification(err.message, NotificationType.Error, 5);
      });
  };

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order.price, exchangeInfo);

  return (
    <div className="candy-buy-modal candy-buy-stripe">
      <div className="candy-buy-stripe-left">
        <div className="candy-buy-modal-thumbnail">
          <Viewer order={order} />
        </div>
        <div className="candy-buy-modal-title">
          {order?.name}
          {order.verifiedNftCollection ? <NftVerification size={24} /> : null}
        </div>
        <div className="candy-label">PRICE</div>
        <div className="candy-price">
          {orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}
          <span className="candy-price-usd">&nbsp; US${paymentPrice}</span>
        </div>
        <div style={{ textAlign: 'left', marginTop: '10px', fontSize: '12px', lineHeight: '18px' }}>
          Final USD price will be based on the official FTX SOLUSD rate at point of transaction confirmation and
          includes processing and FX fees.
        </div>
      </div>
      <div className="candy-buy-stripe-right">
        <div className="candy-title">Pay With Credit Card</div>
        <div className="candy-stripe-logo">
          Powered by <img src={stripeLogo} alt="stripe logo" />
        </div>

        <div className="candy-stripe-block">
          Before buying, please confirm that this is your wallet address. If not, reconnect your wallet.
          <span>{walletAddress}</span>
        </div>

        {paymentEntityId ? (
          <Elements stripe={stripePromise}>
            <StripeCardDetail
              paymentEntityId={paymentEntityId}
              shopAddress={shopAddress}
              tokenAccount={order.tokenAccount}
              onClickedPayCallback={onClickedPayCallback}
            />
          </Elements>
        ) : (
          <Processing />
        )}
      </div>
    </div>
  );
};
