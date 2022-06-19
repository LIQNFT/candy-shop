import { CandyShopTrade, CandyShopTradeBuyParams, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { StripePayment } from 'components/Payment';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import { TIMEOUT_EXTRA_LOADING } from 'constant';
import { useCandyShopPayContext } from 'contexts/CandyShopPayProvider';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { ShopExchangeInfo, BuyModalType, PaymentError } from 'model';
import React, { useMemo, useState } from 'react';
import { ErrorMsgMap, ErrorType, handleError } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { BuyModalConfirmed } from './BuyModalConfirmed';
import { BuyModalDetail } from './BuyModalDetail';

import './style.less';

enum ProcessingText {
  BUY = 'Processing purchase',
  STRIPE = 'Processing purchase, do not close the window...'
}

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
  sellerUrl
}) => {
  const [state, setState] = useState<BuyModalType>(BuyModalType.DISPLAY);
  const [hash, setHash] = useState(''); // txHash
  const [processingText, setProcessingText] = useState<ProcessingText>(ProcessingText.BUY);
  const [paymentPrice, setPaymentPrice] = useState<number>();
  const [paymentError, setPaymentError] = useState<PaymentError>();

  const timeoutRef = useUnmountTimeout();
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
    setState(BuyModalType.PROCESSING);

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
        timeoutRef.current = setTimeout(() => {
          setState(BuyModalType.CONFIRMED);
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err: Error) => {
        console.log({ err });
        handleError({ error: err });
        setState(BuyModalType.DISPLAY);
      });
  };

  const onProcessingPay = (type: BuyModalType, error: any) => {
    if (type === BuyModalType.PROCESSING) {
      setProcessingText(ProcessingText.STRIPE);
      setState(BuyModalType.PROCESSING);
      return;
    }
    if (type === BuyModalType.CONFIRMED) {
      setState(BuyModalType.CONFIRMED);
      return;
    }

    if (type === BuyModalType.PAYMENT_ERROR) {
      setState(BuyModalType.PAYMENT_ERROR);
      setPaymentError(error);
      return;
    }

    if (type === BuyModalType.PAYMENT) setState(BuyModalType.PAYMENT);
  };

  const modalWidth = state === BuyModalType.DISPLAY || state === BuyModalType.PAYMENT ? 1000 : 600;
  return (
    <Modal className="candy-buy-modal-container" onCancel={onClose} width={modalWidth}>
      <div className="candy-buy-modal">
        {state === BuyModalType.DISPLAY && (
          <BuyModalDetail
            order={order}
            buy={buy}
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            sellerUrl={sellerUrl}
            shopAddress={shopAddress}
            setPaymentPrice={setPaymentPrice}
            paymentPrice={paymentPrice}
            onPayment={() => setState(BuyModalType.PAYMENT)}
          />
        )}
        {state === BuyModalType.PROCESSING && <Processing text={processingText} />}
        {(state === BuyModalType.CONFIRMED || state === BuyModalType.PAYMENT_ERROR) && wallet && (
          <BuyModalConfirmed
            walletPublicKey={wallet.publicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            paymentPrice={paymentPrice}
            error={paymentError}
          />
        )}

        {state === BuyModalType.PAYMENT && stripePublicKey && wallet?.publicKey && order && paymentPrice && (
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
