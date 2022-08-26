import React, { useRef, useState } from 'react';
import { ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Blockchain, Order as OrderSchema } from '@liqnft/candy-shop-types';

import { Modal } from 'components/Modal';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import { ShopExchangeInfo, TransactionState } from 'model';
import { handleError } from 'utils/ErrorHandler';
import { CancelModalConfirm } from './CancelModalConfirm';
import { CancelModalDetail } from './CancelModalDetail';

import './index.less';

const Logger = 'CandyShopUI/CancelModal';

interface CancelModalProps {
  publicKey: string | undefined;
  order?: OrderSchema;
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
  // save for UI confirm modal
  const orderRef = useRef(order);

  const cancel = async () => {
    if (!order) return;
    setState(TransactionState.PROCESSING);

    return cancelOrder(order)
      .then((txHash) => {
        console.log(`${Logger}: Cancel order made with transaction hash=${txHash}`);
        setState(TransactionState.CONFIRMED);
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
      {state === TransactionState.DISPLAY && publicKey && order && (
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
      {state === TransactionState.CONFIRMED && <CancelModalConfirm order={orderRef.current} onCancel={onClose} />}
      <PoweredByInBuyModal />
    </Modal>
  );
};
