import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';

import BuyModalConfirmed from './AuctionModalConfirmed';
import { AuctionModalDetail } from './AuctionModalDetail';

import { TransactionState } from 'model';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';

import './style.less';

export interface AuctionModalProps {
  order: OrderSchema;
  onClose: () => void;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  order,
  onClose,
  wallet,
  walletConnectComponent,
  candyShop
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState(''); // txHash

  const timeoutRef = useUnmountTimeout();

  const placeBid = () => {
    console.log('Place bid');
  };

  return (
    <Modal onCancel={onClose} width={state !== TransactionState.DISPLAY ? 600 : 1000}>
      <div className="candy-buy-modal">
        {state === TransactionState.DISPLAY && (
          <AuctionModalDetail
            order={order}
            buy={placeBid}
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            candyShop={candyShop}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text="Processing purchase" />}
        {state === TransactionState.CONFIRMED && wallet && (
          <BuyModalConfirmed
            walletPublicKey={wallet.publicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            candyShop={candyShop}
          />
        )}
      </div>
    </Modal>
  );
};
