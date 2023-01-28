import WertWidget from '@wert-io/widget-initializer';
import React, { useCallback, useEffect, useState } from 'react';
import { CandyShopPay, CreateWertPaymentParams, OrderPayloadResponse } from '@liqnft/candy-shop-sdk';
import { ConfirmWertPaymentParams, Order, PaymentInfo, SingleBase, WertConfirmInfo } from '@liqnft/candy-shop-types';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { Viewer } from 'components/Viewer';
import { getPrice } from 'utils/getPrice';
import { BuyModalState, PaymentErrorDetails, ShopExchangeInfo } from 'model';
import { handleError } from 'utils/ErrorHandler';

const Logger = 'CandyShopUI/WertPayment';

// Refer to https://wert-io.notion.site/Getting-started-f4b5517c31364b7f8c7bdb6f94a51426#8a81ce141b4b453991fd0492a44f328c
enum WertOrigin {
  Sandbox = 'https://sandbox.wert.io',
  Production = 'https://widget.wert.io'
}

interface WertPaymentProps {
  shopAddress: string;
  walletAddress: string;
  order: Order;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  orderPayload: OrderPayloadResponse;
  isProd: boolean;
  onProcessingPay: (type: BuyModalState, error?: PaymentErrorDetails) => void;
}

export const WertPayment: React.FC<WertPaymentProps> = ({
  shopAddress,
  walletAddress,
  order,
  exchangeInfo,
  shopPriceDecimals,
  shopPriceDecimalsMin,
  orderPayload,
  isProd,
  onProcessingPay
}) => {
  const [paymentStatus, setPaymentStatus] = useState<string>('init');

  const handlePaymentStatusCallback = useCallback(
    (data: any, uuid: string) => {
      /**
       * TBD UX points (remove this comment once finalize):
       * 1. We should show some loading state when data.status === 'pending' in our BuyModal? Wert's widget is just a label
       * 2. We can turn into BuyModalState.CONFIRMED after timeout when data.status === success (like following is doing).
       * 3. Or we should consider to combine Wert Widget into our BuyModal transition?
       * 4. Don't use our BuyModal transition?
       */
      console.log(`${Logger}: handlePaymentStatusCallback, data=`, data);
      if (data.status === 'pending' && uuid) {
        // Sending the confirm info to CandyShop server
        const params: ConfirmWertPaymentParams = {
          shopId: shopAddress,
          paymentEntityId: uuid,
          paymentStatus: data
        };
        CandyShopPay.confirmPayment(params)
          .then((res: SingleBase<PaymentInfo>) => {
            console.log(`${Logger}: confirmPayment on CandyShop server success, res=`, res.result);
          })
          .catch((err: Error) => {
            console.error(`${Logger}: confirmPayment on CandyShop server failed, error=`, err);
          });
      } else if (data.status === 'success') {
        // Transit to Confirm UI after certain timeouts
        setTimeout(() => {
          onProcessingPay(BuyModalState.CONFIRMED);
        }, 5000);
      }
    },
    [onProcessingPay, shopAddress]
  );

  const renderWidgetUI = useCallback(
    (uuid: string, wertConfirmInfo: WertConfirmInfo) => {
      setPaymentStatus('rendering');
      const otherWidgetOptions = {
        partner_id: wertConfirmInfo.partnerId,
        container_id: 'wert-widget',
        click_id: uuid,
        origin: isProd ? WertOrigin.Production : WertOrigin.Sandbox,
        width: 600,
        height: 400,
        commodity: wertConfirmInfo.commodity
      };
      const nftOptions = {
        extra: {
          item_info: {
            name: order.name,
            seller: order.walletAddress
          }
        }
      };
      const wertWidget = new WertWidget({
        ...wertConfirmInfo.signedData,
        ...otherWidgetOptions,
        ...nftOptions,
        listeners: {
          ['position']: (data: any) => console.log(`${Logger}: step:`, data.step),
          ['payment-status']: (data: any) => handlePaymentStatusCallback(data, uuid)
        }
      });
      wertWidget.mount();
    },
    [order, handlePaymentStatusCallback, isProd]
  );

  useEffect(() => {
    // Call createPayment only when init
    if (paymentStatus === 'init') {
      const params: CreateWertPaymentParams = {
        shopProgramId: order.programId,
        shopId: shopAddress,
        shopCreatorAddress: order.candyShopCreatorAddress,
        buyerWalletAddress: walletAddress,
        tokenAccount: order.tokenAccount,
        tokenMint: order.tokenMint,
        orderPayload
      };
      CandyShopPay.createPayment(params)
        .then((res: SingleBase<PaymentInfo>) => {
          console.log(`${Logger}: createPayment success, res=`, res.result);
          const wertConfirmInfo = res.result.wertConfirmInfo;
          if (!wertConfirmInfo) {
            console.error(`${Logger}: createPayment failed, invalid wertConfirmInfo`);
            return;
          }
          const entityId = res.result.paymentEntityId;
          renderWidgetUI(entityId, wertConfirmInfo);
        })
        .catch((err: Error) => {
          handleError(err);
          console.error(`${Logger}: createPayment failed, error=`, err);
          onProcessingPay(BuyModalState.PAYMENT_ERROR);
        });
    }
  }, [paymentStatus, onProcessingPay, shopAddress, order, orderPayload, walletAddress, renderWidgetUI]);

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order.price, exchangeInfo);

  return (
    <>
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
          <div className="candy-price">{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
        </div>
      </div>

      <div id="wert-widget"></div>
    </>
  );
};
