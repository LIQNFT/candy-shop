import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
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
import { CandyShopPay } from '@liqnft/candy-shop-sdk';
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

  const onClickedPayCallback = (params: ConfirmStripePaymentParams) => {
    onProcessingPay(BuyModalState.PROCESSING);
    CandyShopPay.confirmPayment(params)
      .then((res: SingleBase<PaymentInfo>) => {
        if (res.success && res.result) {
          onProcessingPay(BuyModalState.CONFIRMED);
          refreshSubject(ShopStatusType.UserNft, Date.now());
        } else {
          if (res.msg) {
            console.log(`${Logger}: confirmPayment failed, reason=`, res.msg);
            const errorDetails: PaymentErrorDetails = {
              title: 'Payment Error',
              content: res.msg
            };
            onProcessingPay(BuyModalState.PAYMENT_ERROR, errorDetails);
            notification(res.msg, NotificationType.Error, 5);
          }
          if ('errorDetails' in res) {
            onProcessingPay(BuyModalState.PAYMENT_ERROR, (res as any).errorDetails);
          }
        }
      })
      .catch((err: Error) => {
        console.log(`${Logger}: confirmPayment failed, err=`, err);
        const errorDetails: PaymentErrorDetails = {
          title: err.name,
          content: err.message
        };
        onProcessingPay(BuyModalState.PAYMENT_ERROR, errorDetails);
        notification(err.message, NotificationType.Error, 5);
      });
  };

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order, exchangeInfo);

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
          USD/SGD price is for reference only and subject to final confirmation{' '}
          <span className="candy-stripe-note">
            (include disclaimers here for fees + buy buffer spread) - VN will update
          </span>
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
