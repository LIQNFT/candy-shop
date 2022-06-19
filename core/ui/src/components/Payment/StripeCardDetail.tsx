import './card-payment-form.less';
import React from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import {
  CreatePaymentMethodCardData,
  CreatePaymentMethodData,
  PaymentMethod,
  PaymentMethodResult,
  StripeCardNumberElementOptions,
  StripeElementClasses,
  StripeElementStyle
} from '@stripe/stripe-js';
import { ConfirmStripePaymentParams, PaymentMethodType } from '@liqnft/candy-shop-types';
import { LoadingSkeleton } from 'components/LoadingSkeleton';

const Logger = 'CandyShopUI/CardPaymentModal';

export interface StripeCardDetailProps {
  paymentId: string;
  shopAddress: string;
  tokenAccount: string;
  onClickedPayCallback: (param: ConfirmStripePaymentParams) => void;
}

export const StripeCardDetail: React.FC<StripeCardDetailProps> = ({
  paymentId,
  shopAddress,
  tokenAccount,
  onClickedPayCallback
}) => {
  const stripe = useStripe();
  const stripeElements = useElements();

  if (!stripe || !stripeElements) {
    console.log(`${Logger}: Loading Stripe.js`);
    return <LoadingSkeleton />;
  }

  const getPaymentMethod = (paymentMethodData: CreatePaymentMethodData): Promise<PaymentMethod> => {
    return stripe.createPaymentMethod(paymentMethodData).then((result: PaymentMethodResult) => {
      if (result.error) {
        throw result.error;
      }
      if (!result.paymentMethod) {
        throw Error('Undefined PaymentMethod');
      }
      return result.paymentMethod;
    });
  };

  // TODO: Check element change to enable/disable Pay button

  const getConfirmPaymentParams = async () => {
    const cardPaymentElement = stripeElements.getElement(PaymentMethodType.CARD);
    if (!cardPaymentElement) {
      throw Error('Abort submit payment, StripePaymentElement is null');
    }
    const paymentMethodData: CreatePaymentMethodCardData = {
      type: 'card',
      card: cardPaymentElement
    };
    const paymentMethod = await getPaymentMethod(paymentMethodData);
    const params: ConfirmStripePaymentParams = {
      paymentId: paymentId,
      paymentMethodId: paymentMethod.id,
      shopId: shopAddress,
      tokenAccount: tokenAccount
    };
    return params;
  };

  const onClickedPay = () => {
    getConfirmPaymentParams()
      .then((res: ConfirmStripePaymentParams) => {
        onClickedPayCallback(res);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: getConfirmPaymentParams failed, err=`, err);
      });
  };

  // TODO: Customize CardElement styling by overriding stripe's style
  const cardElementCustomClassName: StripeElementClasses = {
    base: 'card-element-base-style'
  };

  const cardElementStyle: StripeElementStyle = {};
  const cardElementOptions: StripeCardNumberElementOptions = {
    showIcon: true,
    classes: cardElementCustomClassName,
    style: cardElementStyle
  };

  return (
    <div className="card-payment-modal-container">
      <div className="candy-title">Credit Card</div>
      <CardElement options={cardElementOptions}></CardElement>
      <button className="candy-button card-payment-modal-button" onClick={onClickedPay}>
        Pay
      </button>
    </div>
  );
};
