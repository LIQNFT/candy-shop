import { Modal } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CandyShop } from '../../core/CandyShop';
import Processing from '../Processing/Processing';
import { CancelModalDetail } from './CancelModalDetail';
import { CancelModalConfirm } from './CancelModalConfirm';

import './style.less';

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

    if (step === 2) {
      setTimeout(() => {
        location.reload();
      }, 3_000);
    }
  }, [step, onUnSelectItem]);

  const viewComponent = useMemo(() => {
    return new Map()
      .set(
        0,
        <CancelModalDetail
          onCancel={onCloseModal}
          candyShop={candyShop}
          order={order}
          onChangeStep={onChangeStep}
        />
      )
      .set(1, <Processing text="Processing Cancel" />)
      .set(2, <CancelModalConfirm order={order} onCancel={onCloseModal} />);
  }, [order, candyShop, onCloseModal]);

  return (
    <Modal
      visible
      onCancel={onCloseModal}
      className="candy-shop-modal cancel-modal"
      width={step === 0 ? 1000 : 600}
      footer={null}
    >
      {viewComponent.get(step)}
    </Modal>
  );
};
