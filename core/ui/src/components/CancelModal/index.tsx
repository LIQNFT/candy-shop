import React, { useState } from 'react';
import { ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Blockchain, Order as OrderSchema } from '@liqnft/candy-shop-types';

import { Modal } from 'components/Modal';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import { TIMEOUT_EXTRA_LOADING } from 'constant';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { ShopExchangeInfo, TransactionState } from 'model';
import { handleError } from 'utils/ErrorHandler';
import { CancelModalConfirm } from './CancelModalConfirm';
import { CancelModalDetail } from './CancelModalDetail';

import './index.less';

const Logger = 'CandyShopUI/CancelModal';

interface CancelModalProps {
  publicKey: string | undefined;
  order: OrderSchema;
  onClose: any;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
  cancelOrder: (order: OrderSchema) => Promise<any>;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  publicKey,
  order,
  onClose,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  candyShopEnv,
  explorerLink,
  cancelOrder
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const timeoutRef = useUnmountTimeout();

  const cancel = async () => {
    setState(TransactionState.PROCESSING);

    return cancelOrder(order)
      .then((txHash) => {
        console.log(`${Logger}: Cancel order made with transaction hash=${txHash}`);
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.CONFIRMED);
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: Cancel order failed, error=${err}`);
        err.message = (err as any).code || err.message;
        handleError({ error: err });
        setState(TransactionState.DISPLAY);
      });
  };

  return (
    <Modal
      className="candy-buy-modal-container"
      onCancel={onClose}
      width={state !== TransactionState.DISPLAY ? 600 : 1000}
    >
      {state === TransactionState.DISPLAY && publicKey && (
        <CancelModalDetail
          order={order}
          cancel={cancel}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={shopPriceDecimalsMin}
          shopPriceDecimals={shopPriceDecimals}
          candyShopEnv={candyShopEnv}
          explorerLink={explorerLink}
        />
      )}
      {state === TransactionState.PROCESSING && <Processing text="Canceling your sale" />}
      {state === TransactionState.CONFIRMED && <CancelModalConfirm order={order} onCancel={onClose} />}
      <PoweredByInBuyModal />
    </Modal>
  );
};
