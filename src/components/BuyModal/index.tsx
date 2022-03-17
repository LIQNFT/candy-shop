import { Modal } from 'antd';
import { PublicKey } from '@solana/web3.js';
import React, { useMemo, useState, useCallback } from 'react';
import BuyModalConfirmed from './BuyModalConfirmed';
import BuyModalDetail from './BuyModalDetail';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CandyShop } from '../../core/CandyShop';
import { BN } from '@project-serum/anchor';
import Processing from '../Processing/Processing';
import { errorNotification } from '../../utils/notification';

import './style.less';

export interface BuyModalProps {
  order: OrderSchema;
  onClose: any;
  walletPublicKey: PublicKey | undefined;
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

  const [hash, setHash] = useState(''); // txHash

  // Handle buy
  const buy = useCallback(async () => {
    try {
      // Change to step 1: processing
      setStep(1);

      const txHash = await candyShop.buy(
        new PublicKey(order.walletAddress),
        new PublicKey(order.tokenAccount),
        new PublicKey(order.tokenMint),
        candyShop.treasuryMint(),
        new BN(order.price)
      );

      setHash(txHash);
      console.log('Buy order made with transaction hash', txHash);

      setStep(2);
    } catch (error) {
      // Show error and redirect to step 0 again
      errorNotification(
        new Error('Transaction failed. Please try again later.')
      );
      setStep(0);
    }
  }, [
    candyShop,
    order.price,
    order.tokenAccount,
    order.tokenMint,
    order.walletAddress,
  ]);

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
            walletConnectComponent={walletConnectComponent}
          />
        )
        .set(1, <Processing text="Processing purchase" />)
        .set(
          2,
          <BuyModalConfirmed
            walletPublicKey={walletPublicKey}
            order={order}
            txHash={hash}
          />
        ),
    [order, hash, buy, walletConnectComponent, walletPublicKey]
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
