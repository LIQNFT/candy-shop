import { BN } from '@project-serum/anchor';
import { web3 } from '@project-serum/anchor';
import Modal from 'components/Modal';
import Processing from 'components/Processing';
import { CandyShop } from 'core/CandyShop';
import React, { useState } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { notification } from 'utils/rc-notification';
import { TransactionState } from '../../model';
import BuyModalConfirmed from './BuyModalConfirmed';
import BuyModalDetail from './BuyModalDetail';
import './style.less';

export interface BuyModalProps {
  order: OrderSchema;
  onClose: any;
  walletPublicKey: web3.PublicKey | undefined;
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
  const [step, setStep] = useState(TransactionState.DISPLAY);

  const [hash, setHash] = useState(''); // txHash

  const buy = async () => {
    setStep(TransactionState.PROCESSING);
    return candyShop
      .buy(
        new web3.PublicKey(order.walletAddress),
        new web3.PublicKey(order.tokenAccount),
        new web3.PublicKey(order.tokenMint),
        new BN(order.price)
      )
      .then((txHash) => {
        setHash(txHash);
        console.log('Buy order made with transaction hash', txHash);

        setStep(TransactionState.CONFIRMED);
      })
      .catch((err) => {
        console.log({ err });
        notification('Transaction failed. Please try again later.', 'error');
        setStep(TransactionState.DISPLAY);
      });
  };

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
              candyShop={candyShop}
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
