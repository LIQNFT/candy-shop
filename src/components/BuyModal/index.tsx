import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import Modal from 'components/Modal';
import Processing from 'components/Processing';
import { CandyShop } from 'core/CandyShop';
import React, { useCallback, useState } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { errorNotification } from 'utils/notification';
import BuyModalConfirmed from './BuyModalConfirmed';
import BuyModalDetail from './BuyModalDetail';
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

  return (
    <>
      <Modal onCancel={onClose} width={step !== 0 ? 600 : 1000}>
        <div className="buy-modal">
          {step === 0 && (
            <BuyModalDetail
              order={order}
              buy={buy}
              walletPublicKey={walletPublicKey}
              walletConnectComponent={walletConnectComponent}
            />
          )}
          {step === 1 && <Processing text="Processing purchase" />}
          {step === 2 && (
            <BuyModalConfirmed
              walletPublicKey={walletPublicKey}
              order={order}
              txHash={hash}
            />
          )}
        </div>
      </Modal>
    </>
  );
};
