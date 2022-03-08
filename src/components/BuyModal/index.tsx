import { Modal } from 'antd';
import { Connection, PublicKey } from '@solana/web3.js';
import React, { useCallback, useMemo, useState } from 'react';
import BuyModalConfirmed from './BuyModalConfirmed';
import BuyModalDetail from './BuyModalDetail';
import BuyModalProcessing from './BuyModalProcessing';
import './style.less';

export interface BuyModalProps {
  order: any;
  onClose: any;
  connection: Connection;
  walletPublicKey: PublicKey;
  walletConnectComponent: React.ReactElement;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  order,
  onClose,
  connection,
  walletPublicKey,
  walletConnectComponent,
}) => {
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
          <BuyModalDetail
            onChangeStep={onChangeStep}
            order={order}
            connection={connection}
            walletPublicKey={walletPublicKey}
            walletConnectComponent={walletConnectComponent}
          />
        )
        .set(
          1,
          <BuyModalProcessing
            onChangeStep={onChangeStep}
          />
        )
        .set(
          2,
          <BuyModalConfirmed
            order={order}
            onOk={onClose}
          />
        ),
    [order, walletPublicKey, onChangeStep]
  );

  return (
    <Modal
      visible
      onCancel={onClose}
      className="candy-shop-modal buy-modal"
      width={step === 0 ? 1000 : 600}
      footer={null}
    >
      {viewComponent.get(step)}
    </Modal>
  );
};
