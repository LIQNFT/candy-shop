import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Drop } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import React, { useState } from 'react';
import { ErrorMsgMap, ErrorType } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { EditionModalDetail } from './EditionModalDetail';
import './style.less';
import { handleError } from 'utils/ErrorHandler';
import { EditionModalRedemption } from './EditionModalRedemption';

export interface EditionModalProps {
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement;
  onClose: () => void;
  candyShop: CandyShop;
  dropNft: Drop;
  onMintSuccess?: (drop: Drop) => void;
}

const Logger = 'CandyShopUI/MintPrint';

const enum EditionState {
  DISPLAY,
  REDEMPTION_INFO,
  PROCESSING
}

export const EditionModal: React.FC<EditionModalProps> = ({
  wallet,
  walletConnectComponent,
  onClose,
  dropNft,
  candyShop,
  onMintSuccess
}) => {
  const [editionState, setEditionState] = useState<EditionState>(EditionState.DISPLAY);

  const onMintConfirm = async (userInfo?: string) => {
    if (!wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    setEditionState(EditionState.PROCESSING);

    const params: Parameters<typeof candyShop.mintNewPrint>[0] = {
      editionBuyer: wallet,
      nftOwnerTokenAccount: new web3.PublicKey(dropNft.nftTokenAccount),
      masterMint: new web3.PublicKey(dropNft.nftMint),
      whitelistMint: dropNft.whitelistMint ? new web3.PublicKey(dropNft.whitelistMint) : undefined,
      info: userInfo ?? undefined
    };
    candyShop
      .mintNewPrint(params)
      .then(() => {
        notification('Mint Edition successful.', NotificationType.Success);
        setEditionState(EditionState.DISPLAY);
        onMintSuccess && onMintSuccess(dropNft);
      })
      .catch((error: Error) => {
        console.log(`${Logger}: candyShop.mintNewPrint fail, error=`, error);
        handleError(error, 'Mint edition failed');
        setEditionState(EditionState.DISPLAY);
      });
  };

  const onMint = (userInfo?: string) => {
    if (dropNft.hasRedemption) {
      if (dropNft.userInputsSchema) return setEditionState(EditionState.REDEMPTION_INFO);
      return notification('Redemption NFT info not found.', NotificationType.Error);
    }

    onMintConfirm(userInfo);
  };

  return (
    <Modal
      className="candy-edition-modal-container"
      onCancel={onClose}
      width={editionState !== EditionState.DISPLAY ? 600 : 1000}
    >
      <div className="candy-edition-modal">
        {editionState === EditionState.DISPLAY && (
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
        {editionState === EditionState.REDEMPTION_INFO && (
          <EditionModalRedemption
            onBack={() => setEditionState(EditionState.DISPLAY)}
            dropNft={dropNft}
            onMint={onMintConfirm}
          />
        )}
        {editionState === EditionState.PROCESSING && <Processing text="Processing purchase" />}
      </div>

      <PoweredByInBuyModal />
    </Modal>
  );
};
