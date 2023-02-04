import {
  OrderPayloadResponse,
  CandyShopPay,
  getBaseUrl,
  isCandyShopProdUrl,
  CreateWertPaymentParams
} from '@liqnft/candy-shop-sdk';

import WertWidget from '@wert-io/widget-initializer';
import {
  Blockchain,
  ConfirmWertPaymentParams,
  Order,
  PaymentInfo,
  SingleBase,
  WertConfirmInfo
} from '@liqnft/candy-shop-types';
import { BuyModalState } from 'model';
import { useState } from 'react';
import { handleError } from 'utils/ErrorHandler';

enum WertOrigin {
  Sandbox = 'https://sandbox.wert.io',
  Production = 'https://widget.wert.io'
}

interface UseWertIoProps {
  shopAddress: string;
  onProcessingPay: (type: BuyModalState, error?: any) => void;
  candyShopEnv: Blockchain;
  order?: Order;
  walletPublicKey?: string;
  evmOrderPayload?: OrderPayloadResponse;
}

const Logger = 'useWertIo';

export const useWertIo = ({
  walletPublicKey,
  evmOrderPayload,
  shopAddress,
  candyShopEnv,
  onProcessingPay,
  order
}: UseWertIoProps) => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>();

  const onWertPaymentStatus = (data: any, uuid: string) => {
    console.log(`${Logger}: onWertPaymentStatus, data=`, data);
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
          // Transit to Confirm UI after certain timeouts
          onProcessingPay(BuyModalState.CONFIRMED);
          setPaymentInfo(res.result);
        })
        .catch((err: Error) => {
          console.error(`${Logger}: confirmPayment on CandyShop server failed, error=`, err);
        });
    } else if (data.status === 'success') {
      onProcessingPay(BuyModalState.CONFIRMED);
    }
  };

  const onOpenWertWidget = (uuid: string, wertConfirmInfo: WertConfirmInfo, order: Order) => {
    const otherWidgetOptions = {
      partner_id: wertConfirmInfo.partnerId,
      container_id: 'wert-widget',
      click_id: uuid,
      origin: isCandyShopProdUrl(getBaseUrl(candyShopEnv)) ? WertOrigin.Production : WertOrigin.Sandbox,
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
        ['payment-status']: (data: any) => onWertPaymentStatus(data, uuid),
        ['close']: () => console.log(`${Logger}: close`),
        ['loaded']: () => console.log(`${Logger}: loaded`)
      }
    });
    wertWidget.open();
    onProcessingPay(BuyModalState.PROCESSING);
  };

  const onPayWithWert = () => {
    if (!walletPublicKey || !evmOrderPayload || !order) return;
    const params: CreateWertPaymentParams = {
      shopProgramId: order.programId,
      shopId: shopAddress,
      shopCreatorAddress: order.candyShopCreatorAddress,
      buyerWalletAddress: walletPublicKey,
      tokenAccount: order.tokenAccount,
      tokenMint: order.tokenMint,
      orderPayload: evmOrderPayload
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
        onOpenWertWidget(entityId, wertConfirmInfo, order);
      })
      .catch((err: Error) => {
        handleError(err);
        console.error(`${Logger}: createPayment failed, error=`, err);
        onProcessingPay(BuyModalState.PAYMENT_ERROR);
      });
  };

  return { onPayWithWert, paymentInfo };
};
