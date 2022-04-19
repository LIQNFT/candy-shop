import { AnchorWallet } from '@solana/wallet-adapter-react';
import Modal from 'components/Modal';
import Processing from 'components/Processing';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { TransactionState } from 'model';
import React, { useCallback, useState } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CancelModalConfirm } from './CancelModalConfirm';
import { CancelModalDetail } from './CancelModalDetail';
import './index.less';

export interface CancelModalProps {
  order: OrderSchema;
  onClose: any;
  candyShop: CandyShop;
  wallet: AnchorWallet;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  order,
  onClose: onUnSelectItem,
  candyShop,
  wallet,
}) => {
  const [state, setState] = useState<TransactionState>(
    TransactionState.DISPLAY
  );

  // Handle change step
  const onChangeStep = (state: TransactionState) => setState(state);

  const onCloseModal = useCallback(() => {
    onUnSelectItem();
    if (state === TransactionState.CONFIRMED)
      // TODO: remove the window reload but using callback function to let parent reload by setState
      setTimeout(() => window.location.reload(), 3_000);
  }, [state, onUnSelectItem]);

  return (
    <Modal
      onCancel={onCloseModal}
      width={state !== TransactionState.DISPLAY ? 600 : 1000}
    >
      {state === TransactionState.DISPLAY && wallet && (
        <CancelModalDetail
          onCancel={onCloseModal}
          candyShop={candyShop}
          order={order}
          onChangeStep={onChangeStep}
          wallet={wallet}
        />
      )}
      {state === TransactionState.PROCESSING && (
        <Processing text="Canceling your sale" />
      )}
      {state === TransactionState.CONFIRMED && (
        <CancelModalConfirm order={order} onCancel={onCloseModal} />
      )}
    </Modal>
  );
};
