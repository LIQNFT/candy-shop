import { Modal } from 'antd';
import { Connection, PublicKey } from '@solana/web3.js';
import React, { useCallback, useMemo, useState } from 'react';
import BuyModalConfirmed from './BuyModalConfirmed';
import BuyModalDetail from './BuyModalDetail';
import BuyModalProcessing from './BuyModalProcessing';
import './style.less';
import {Order as OrderSchema} from "solana-candy-shop-schema/dist";
import { CandyShop } from '../../core/CandyShop';
import { BN } from '@project-serum/anchor';


export interface BuyModalProps {
  order: OrderSchema;
  onClose: any;
  walletPublicKey: PublicKey;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  order,
  onClose,
  walletPublicKey,
  candyShop,
  walletConnectComponent,
}) => {
  /**
   * Step in here contains
   * 0: Content
   * 1: Processing
   * 2: Confirmed
   **/

  const [step, setStep] = useState(0);

  // Handle buy
  const buy = async () => {
    const txHash = await candyShop.buy(
      new PublicKey(order.walletAddress),
      new PublicKey(order.tokenAccount),
      new PublicKey(order.tokenMint),
      candyShop.treasuryMint(),
      new BN(order.price)
    );

    console.log('Buy order made with transaction hash', txHash);

    setStep(2);
  }

  // Handle change step
  const onChangeStep = async (step: number) => {
    setStep(step);
  };

  // Render view component
  const viewComponent = useMemo(
    () =>
      new Map()
        .set(
          0,
          <BuyModalDetail
            order={order}
            buy={buy}
            walletPublicKey={walletPublicKey}
            candyShop={candyShop}
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
          />
        ),
    [order, candyShop, onChangeStep]
  );

  /* TODO: Implement the BuyModalProcessing step when buy transaction is running. If buy transaction fails, it should display error message. */

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
