import React, { useEffect, useMemo, useState } from 'react';
import {
  CandyShopPay,
  ExplorerLinkBase,
  OrderPayloadResponse,
  getBaseUrl,
  isCandyShopProdUrl
} from '@liqnft/candy-shop-sdk';
import { Blockchain, Order as OrderSchema, PaymentErrorName } from '@liqnft/candy-shop-types';

import { Modal } from 'components/Modal';
import { WertPayment } from 'components/Payment';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import { ShopExchangeInfo, BuyModalState, PaymentErrorDetails, CreditCardPayAvailability } from 'model';
import { ErrorMsgMap, ErrorType, handleError } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { BuyModalConfirmed } from './BuyModalConfirmed';
import { BuyModalDetail } from './BuyModalDetail';

import './style.less';
import { useCallback } from 'react';

enum ProcessingTextType {
  General = 'Processing purchase',
  CreditCard = 'Processing purchase, do not close the window...'
}

const Logger = 'CandyShopUI/BuyModalDetail';

export interface BuyModalProps {
  walletPublicKey: string | undefined;
  shopAddress: string;
  order: OrderSchema;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
  onClose: () => void;
  buyNft: (order: OrderSchema) => Promise<string>;
  getEvmOrderPayloadCallback?: (buyerAddress: string, order: OrderSchema) => Promise<OrderPayloadResponse | undefined>;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  walletPublicKey,
  shopAddress,
  order,
  walletConnectComponent,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl,
  candyShopEnv,
  explorerLink,
  onClose,
  buyNft,
  getEvmOrderPayloadCallback
}) => {
  const [state, setState] = useState<BuyModalState>(BuyModalState.DISPLAY);
  const [hash, setHash] = useState(''); // txHash
  const [processingText, setProcessingText] = useState<ProcessingTextType>(ProcessingTextType.General);
  const [paymentError, setPaymentError] = useState<PaymentErrorDetails>();
  const [creditCardPayAvailable, setCreditCardPayAvailable] = useState<CreditCardPayAvailability>();
  const [evmOrderPayload, setEvmOrderPayload] = useState<OrderPayloadResponse | undefined>();

  const buy = async () => {
    if (!walletPublicKey) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    setState(BuyModalState.PROCESSING);

    buyNft(order)
      .then((txHash: string) => {
        setHash(txHash);
        console.log('Buy order made with transaction hash', txHash);
        setState(BuyModalState.CONFIRMED);
      })
      .catch((err: Error) => {
        console.log(`${Logger} buyNft failed, error=`, err);
        handleError(err, 'Buy nft failed');
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
    if (type === BuyModalState.PAYMENT) {
      setState(BuyModalState.PAYMENT);
    }
  };

  const getEvmOrderPayload = useCallback(() => {
    if (getEvmOrderPayloadCallback && walletPublicKey?.toString()) {
      getEvmOrderPayloadCallback(walletPublicKey?.toString(), order)
        .then((evmPayload: OrderPayloadResponse | undefined) => {
          console.log('debugger: orderPayload=', evmPayload);
          setEvmOrderPayload(evmPayload);
        })
        .catch((error: Error) => {
          console.log(`${Logger}: getEvmOrderPayloadCallback failed, error=`, error);
        });
    }
  }, [order, walletPublicKey, getEvmOrderPayloadCallback]);

  const isProd = useMemo(() => {
    const url = getBaseUrl(candyShopEnv);
    return isCandyShopProdUrl(url);
  }, [candyShopEnv]);

  useEffect(() => {
    // Only fetch when haven't retrieved the creditCardPayAvailability
    if (creditCardPayAvailable === undefined) {
      getEvmOrderPayload();
      CandyShopPay.checkPaymentAvailability({
        shopId: shopAddress,
        tokenMint: order.tokenMint
      })
        .then(() => {
          setCreditCardPayAvailable(CreditCardPayAvailability.Supported);
        })
        .catch((error: Error) => {
          console.log(
            `${Logger}: checkPaymentAvailability failed, token= ${order.name} ${order.tokenAccount}, reason=`,
            error.message
          );
          if (
            PaymentErrorName.InsufficientPurchaseBalance === error.name ||
            PaymentErrorName.BelowMinPurchasePrice === error.name
          ) {
            // Only show notification when certain PaymentError from checkPaymentAvailability
            handleError(error);
            setCreditCardPayAvailable(CreditCardPayAvailability.Disabled);
            return;
          }
          setCreditCardPayAvailable(CreditCardPayAvailability.Unsupported);
        });
    }
  }, [order.name, order.tokenAccount, order.tokenMint, shopAddress, creditCardPayAvailable, getEvmOrderPayload]);

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
            walletConnectComponent={walletConnectComponent}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            sellerUrl={sellerUrl}
            onPayment={onPaymentCallback}
            creditCardPayAvailable={creditCardPayAvailable}
            candyShopEnv={candyShopEnv}
            explorerLink={explorerLink}
            publicKey={walletPublicKey}
          />
        )}
        {state === BuyModalState.PROCESSING && <Processing text={processingText} />}
        {(state === BuyModalState.CONFIRMED || state === BuyModalState.PAYMENT_ERROR) && walletPublicKey && (
          <BuyModalConfirmed
            walletPublicKey={walletPublicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            error={paymentError}
            candyShopEnv={candyShopEnv}
            explorerLink={explorerLink}
          />
        )}

        {state === BuyModalState.PAYMENT && evmOrderPayload && walletPublicKey && order && (
          <WertPayment
            shopAddress={shopAddress}
            walletAddress={walletPublicKey}
            order={order}
            shopPriceDecimals={shopPriceDecimals}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            exchangeInfo={exchangeInfo}
            orderPayload={evmOrderPayload}
            onProcessingPay={onProcessingPay}
            isProd={isProd}
          />
        )}
      </div>
      <PoweredByInBuyModal />
    </Modal>
  );
};
