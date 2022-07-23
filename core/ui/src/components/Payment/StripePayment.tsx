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
import { ShopExchangeInfo, BuyModalState, PaymentErrorDetails } from 'model';
import { notification, NotificationType } from 'utils/rc-notification';
import { Processing } from 'components/Processing';
import { Viewer } from 'components/Viewer';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { getPrice } from 'utils/getPrice';
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
  const [paymentId, setPaymentId] = useState<string>();

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
      .then((res: SingleBase<PaymentIntentInfo>) => {
        if (res.success && res.result) {
          console.log(`${Logger}: createPayment success, res=`, res.result);
          setPaymentId(res.result.paymentId);
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

  const onClickedPayCallback = (params: ConfirmStripePaymentParams) => {
    onProcessingPay(BuyModalState.PROCESSING);
    CandyShopPay.confirmPayment(params)
      .then((res: SingleBase<PaymentIntentInfo>) => {
        console.log('debugger: confirmPayment res=', res);
        if (res.success && res.result) {
          onProcessingPay(BuyModalState.CONFIRMED);
          console.log(`${Logger}: confirmPayment success=`, res.result);
        } else {
          if (res.msg) {
            console.log(`${Logger}: confirmPayment failed, reason=`, res.msg);
            onProcessingPay(BuyModalState.DISPLAY);
            notification(res.msg, NotificationType.Error, 5);
          }
          if ('errorDetails' in res) {
            onProcessingPay(BuyModalState.PAYMENT_ERROR, (res as any).errorDetails);
          }
        }
      })
      .catch((err: any) => {
        onProcessingPay(BuyModalState.PAYMENT, err as PaymentErrorDetails);
        console.log(`${Logger}: handleCreatePayment failed, err=`, err);
        notification(err.message, NotificationType.Error, 5);
      });
  };

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order, exchangeInfo);

  return (
    <div className="candy-buy-modal candy-buy-stripe">
      <div>
        <div className="candy-buy-modal-thumbnail">
          <Viewer order={order} />
        </div>
        <div className="candy-buy-modal-title">
          {order?.name}
          {order.verifiedNftCollection ? <NftVerification size={24} /> : null}
        </div>
        <div className="candy-label">CURRENT PRICE</div>
        <div className="candy-price">
          {orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}
          <span className="candy-price-usd">&nbsp;| ${paymentPrice} USD</span>
        </div>
        <div style={{ textAlign: 'left', marginTop: '10px' }}>
          USD/SGD price is for reference only and subject to final confirmation{' '}
          <span className="candy-stripe-note">
            (include disclaimers here for fees + buy buffer spread) - VN will update
          </span>
        </div>
      </div>
      <div>
        <div className="candy-title">Credit Card Payment</div>
        <div className="candy-stripe-logo">
          Powered by <img src={stripeLogo} alt="stripe logo" />
        </div>

        <div className="candy-stripe-block">
          Before buying, please confirm that this is your address. If incorrect, reconnect your wallet.
          <span>{walletAddress}</span>
        </div>

        {paymentId ? (
          <Elements stripe={stripePromise}>
            <StripeCardDetail
              paymentId={paymentId}
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
