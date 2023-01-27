import React, { useState } from 'react';
import { useElements, useStripe, CardCvcElement, CardNumberElement, CardExpiryElement } from '@stripe/react-stripe-js';
import {
  CreatePaymentMethodCardData,
  PaymentMethod,
  PaymentMethodResult,
  Stripe,
  StripeCardNumberElementOptions,
  StripeError
} from '@stripe/stripe-js';
import { ConfirmStripePaymentParams } from '@liqnft/candy-shop-types';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { notification, NotificationType } from 'utils/rc-notification';
import './stripe-card-detail.less';

const Logger = 'CandyShopUI/CardPaymentModal';

export interface StripeCardDetailProps {
  paymentEntityId: string;
  shopAddress: string;
  onClickedPayCallback: (param: ConfirmStripePaymentParams, stripe: Stripe) => void;
}

enum StripeErrorField {
  EMAIL = 'email_invalid',
  NUMBER = 'incomplete_number',
  EXPIRY = 'incomplete_expiry',
  CVC = 'incomplete_cvc'
}

export const StripeCardDetail: React.FC<StripeCardDetailProps> = ({
  paymentEntityId,
  shopAddress,
  onClickedPayCallback
}) => {
  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [error, setError] = useState<StripeError>();

  const stripe = useStripe();
  const stripeElements = useElements();

  if (!stripe || !stripeElements) {
    return <LoadingSkeleton />;
  }

  const onPay = () => {
    const cardPaymentElement = stripeElements.getElement('cardNumber');
    if (!cardPaymentElement) {
      return notification('Abort submit payment, StripePaymentElement is null', NotificationType.Error);
    }

    const paymentMethodData: CreatePaymentMethodCardData = {
      type: 'card',
      card: cardPaymentElement,
      billing_details: { name, email }
    };

    stripe
      .createPaymentMethod(paymentMethodData)
      .then((result: PaymentMethodResult) => {
        if (!result.paymentMethod) {
          throw Error('Undefined PaymentMethod');
        }
        return result.paymentMethod;
      })
      .then((paymentMethod: PaymentMethod) => {
        const params: ConfirmStripePaymentParams = {
          paymentEntityId,
          paymentMethodId: paymentMethod.id,
          shopId: shopAddress
        };
        onClickedPayCallback(params, stripe);
      })
      .catch((error: StripeError) => {
        console.log(`${Logger}: getConfirmPaymentParams failed, err=`, error);
        setError(error);
        throw error;
      });
  };

  return (
    <div className="card-payment-modal-container">
      <label htmlFor="stripe-name">Name</label>
      <div className="candy-stripe-input">
        <input id="stripe-name" placeholder={`Your name`} onChange={(e: any) => setName(e.target.value)} value={name} />
      </div>

      <label htmlFor="stripe-email">Email</label>
      <div className={`candy-stripe-input ${error?.code === StripeErrorField.EMAIL ? 'error' : ''}`}>
        <input
          id="stripe-email"
          placeholder={`Your email`}
          onChange={(e: any) => setEmail(e.target.value)}
          value={email}
        />

        {error?.code === StripeErrorField.EMAIL ? <span className="stripe-error-message">{error.message}</span> : null}
      </div>
      <label htmlFor="stripe-card-number">Credit Card Number*</label>
      <div className={`stripe-input ${error?.code === StripeErrorField.NUMBER ? 'error' : ''}`}>
        <CardNumberElement id="stripe-card-number" options={numberOptions} />
      </div>
      {error?.code === StripeErrorField.NUMBER ? <span className="stripe-error-message">{error.message}</span> : null}

      <div style={{ display: 'flex' }}>
        <div style={{ width: '40%', marginRight: '8px' }}>
          <label htmlFor="stripe-exp">Expiration Date*</label>
          <div className={`stripe-input ${error?.code === StripeErrorField.EXPIRY ? 'error' : ''}`}>
            <CardExpiryElement id="stripe-exp" options={expOptions} />
          </div>
          {error?.code === StripeErrorField.EXPIRY ? (
            <span className="stripe-error-message">{error.message}</span>
          ) : null}
        </div>
        <div style={{ flexGrow: 1 }}>
          <label htmlFor="stripe-cvc">CVC*</label>
          <div className={`stripe-input ${error?.code === StripeErrorField.CVC ? 'error' : ''}`}>
            <CardCvcElement id="stripe-cvc" options={cvcOptions} />
          </div>
          {error?.code === StripeErrorField.CVC ? <span className="stripe-error-message">{error.message}</span> : null}
        </div>
      </div>

      <div className="candy-stripe-terms">
        By proceeding with this transaction, I agree to the{' '}
        <a href="https://liqnft.gitbook.io/docs/candy-shop/terms-of-service" target="_blank" rel="noreferrer noopener">
          Candy Shop Terms & Conditions.
        </a>{' '}
        I acknowledge that transactions on the blockchain are final and non-refundable.
      </div>
      <div className="card-payment-modal-button">
        <button className="candy-button" onClick={onPay}>
          Confirm
        </button>
      </div>
    </div>
  );
};

const numberOptions: StripeCardNumberElementOptions = {
  placeholder: '0000-0000-0000-0000',
  showIcon: true,
  style: {
    base: {
      fontSize: '16px',
      padding: '8px'
    }
  }
};
const expOptions: StripeCardNumberElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      padding: '8px'
    }
  }
};
const cvcOptions: StripeCardNumberElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      padding: '8px'
    }
  }
};
