import React, { useCallback, useState } from 'react';

import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CandyShop } from '../../core/CandyShop';
import Processing from '../Processing/Processing';
import { CancelModalDetail } from './CancelModalDetail';
import { CancelModalConfirm } from './CancelModalConfirm';
import Modal from '../Modal';

// import './style.less';

export interface CancelModalProps {
  order: OrderSchema;
  onClose: any;
  candyShop: CandyShop;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  order,
  onClose: onUnSelectItem,
  candyShop,
}) => {
  const [step, setStep] = useState(0);

  // Handle change step
  const onChangeStep = useCallback((step: number) => setStep(step), []);
  const onCloseModal = useCallback(() => {
    onUnSelectItem();
    if (step === 2) setTimeout(() => window.location.reload(), 3_000);
  }, [step, onUnSelectItem]);

  return (
    <Modal onCancel={onCloseModal}>
      {step === 0 && (
        <CancelModalDetail
          onCancel={onCloseModal}
          candyShop={candyShop}
          order={order}
          onChangeStep={onChangeStep}
        />
      )}

      {step === 1 && <Processing text="Processing Cancel" />}
      {step == 2 && (
        <CancelModalConfirm order={order} onCancel={onCloseModal} />
      )}
    </Modal>
  );
};
