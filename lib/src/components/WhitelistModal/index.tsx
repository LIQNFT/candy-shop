import React, { useState } from 'react';

import { web3 } from '@project-serum/anchor';

import { CandyShop } from 'core/CandyShop';
import Processing from 'components/Processing';

import Modal from 'components/Modal';
import { WhitelistDetail } from './WhitelistDetail';
import { WhitelistForm } from './WhitelistForm';
import { WhitelistNft } from 'solana-candy-shop-schema/dist';

export interface WhitelistModalProps {
  onClose: () => void;
  getWlNfts: () => void;
  signMessage?: () => Promise<Uint8Array>;
  walletPublicKey: web3.PublicKey | undefined;
  candyShop: CandyShop;
}

export const WhitelistModal: React.FC<WhitelistModalProps> = ({
  onClose,
  candyShop,
  signMessage,
  walletPublicKey,
  getWlNfts,
}) => {
  const [step, setStep] = useState<number>(0);
  const [addedCollection, setAddedCollection] = useState<WhitelistNft | null>(
    null
  );

  const onChangeStep = (step: number) => {
    setStep(step);
  };

  const onAddSuccess = (collection: WhitelistNft) => {
    setAddedCollection(collection);
    getWlNfts();
  };

  return (
    <Modal onCancel={onClose} width={600}>
      {step === 0 && (
        <WhitelistForm
          onChangeStep={onChangeStep}
          onAddSuccess={onAddSuccess}
          candyShop={candyShop}
          signMessage={signMessage}
          walletPublicKey={walletPublicKey}
        />
      )}
      {step === 1 && <Processing text="Processing add whitelist..." />}
      {step === 2 && !!addedCollection && (
        <WhitelistDetail collection={addedCollection} onClose={onClose} />
      )}
    </Modal>
  );
};
