import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Drop } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import { TransactionState } from 'model';
import React, { useState } from 'react';
import { ErrorMsgMap, ErrorType } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { EditionModalDetail } from './EditionModalDetail';
import './style.less';

export interface EditionModalProps {
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement;
  onClose: () => void;
  candyShop: CandyShop;
  dropNft: Drop;
  onMintSuccess?: (drop: Drop) => void;
}

const Logger = 'CandyShopUI/MintPrint';

export const EditionModal: React.FC<EditionModalProps> = ({
  wallet,
  walletConnectComponent,
  onClose,
  dropNft,
  candyShop,
  onMintSuccess
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);

  const onMint = async () => {
    if (!wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    setState(TransactionState.PROCESSING);

    const params = {
      editionBuyer: wallet,
      nftOwnerTokenAccount: new web3.PublicKey(dropNft.nftTokenAccount),
      masterMint: new web3.PublicKey(dropNft.nftMint),
      whitelistMint: dropNft.whitelistMint ? new web3.PublicKey(dropNft.whitelistMint) : undefined
    };
    candyShop
      .mintNewPrint(params)
      .then(() => {
        notification('Mint Edition successful.', NotificationType.Success);
        setState(TransactionState.DISPLAY);
        onMintSuccess && onMintSuccess(dropNft);
      })
      .catch((error: Error) => {
        console.log(`${Logger}: candyShop.mintNewPrint fail, error=`, error);
        notification('Mint Edition Failed.', NotificationType.Error);
        setState(TransactionState.DISPLAY);
      });
  };

  return (
    <Modal
      className="candy-edition-modal-container"
      onCancel={onClose}
      width={state !== TransactionState.DISPLAY ? 600 : 1000}
    >
      <div className="candy-edition-modal">
        {state === TransactionState.DISPLAY && (
          <EditionModalDetail
            dropNft={dropNft}
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            onMint={onMint}
            currencySymbol={candyShop.currencySymbol}
            baseUnitsPerCurrency={candyShop.baseUnitsPerCurrency}
            priceDecimalsMin={candyShop.priceDecimalsMin}
            priceDecimals={candyShop.priceDecimals}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text="Processing purchase" />}
      </div>

      <PoweredByInBuyModal />
    </Modal>
  );
};
