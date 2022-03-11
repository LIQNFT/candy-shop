import { Modal } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import Confirmed from './Confirmed';

import Content from './Content';
import ProcessingPurchase from './ProcessingPurchase';
import './style.less';

export interface BuyModal {
  order: any;
  isConnectWallet: boolean;
  onClose: any;
}
const BuyModal = ({ onClose, order, isConnectWallet }: BuyModal) => {
  /**
   * Step in here contains
   * 0: Content
   * 1: Processing
   * 2: Confirmed
   **/

  const [step, setStep] = useState(0);

  // Handle change step
  const onChangeStep = useCallback((step: number) => {
    setStep(step);
  }, []);

  // Render view component
  const viewComponent = useMemo(
    () =>
      new Map()
        .set(
          0,
          <Content
            onChangeStep={onChangeStep}
            order={order}
            isConnectWallet={isConnectWallet}
          />
        )
        .set(1, <ProcessingPurchase onChangeStep={onChangeStep} />)
        .set(2, <Confirmed order={order} />),
    [order, isConnectWallet, onChangeStep]
  );

  return (
    <Modal
      visible
      onCancel={onClose}
      className="candy-modal buy-modal"
      width={step === 0 ? 1092 : 588}
      footer={null}
    >
      {viewComponent.get(step)}
    </Modal>
  );
};

export default BuyModal;
