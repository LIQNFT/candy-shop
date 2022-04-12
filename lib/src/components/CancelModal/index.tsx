import Modal from 'components/Modal';
import Processing from 'components/Processing';
import { CandyShop } from 'core/CandyShop';
import React, { useCallback, useState } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CancelModalConfirm } from './CancelModalConfirm';
import { CancelModalDetail } from './CancelModalDetail';

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
    <Modal onCancel={onCloseModal} width={step !== 0 ? 600 : 1000}>
      {step === 0 && (
        <CancelModalDetail
          onCancel={onCloseModal}
          candyShop={candyShop}
          order={order}
          onChangeStep={onChangeStep}
        />
      )}
      {step === 1 && <Processing text="Canceling your sale" />}
      {step === 2 && (
        <CancelModalConfirm order={order} onCancel={onCloseModal} />
      )}
    </Modal>
  );
};
