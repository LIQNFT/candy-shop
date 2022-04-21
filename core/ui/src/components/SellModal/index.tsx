import React, { useContext, useState } from 'react';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { CandyShop, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { ErrorMsgMap } from 'utils/ErrorHandler';
import { ErrorType, handleError } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { LiqImage } from 'components/LiqImage';
import Modal from 'components/Modal';
import Processing from 'components/Processing';
import IconTick from 'assets/IconTick';

import { TransactionState } from 'model';
import { TIMEOUT_REFETCH_NFT } from 'constant';
import { CandyActionContext } from 'public/Context';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import './style.less';

export interface SellModalProps {
  onCancel: any;
  nft: SingleTokenInfo;
  candyShop: CandyShop;
  wallet: AnchorWallet;
}

const regex3Decimals = new RegExp('^[0-9]{1,11}(?:.[0-9]{1,3})?$');

export const SellModal: React.FC<SellModalProps> = ({
  onCancel,
  nft,
  candyShop,
  wallet
}: SellModalProps) => {
  const [formState, setFormState] = useState<{ price: number | undefined }>({
    price: undefined
  });
  const [state, setState] = useState(TransactionState.DISPLAY);
  const { setRefetch } = useContext(CandyActionContext);

  const timeoutRef = useUnmountTimeout();

  // List for sale and move to next step
  const sell = async () => {
    setState(TransactionState.PROCESSING);

    if (!wallet) {
      notification(
        ErrorMsgMap[ErrorType.InvalidWallet],
        NotificationType.Error
      );
      return;
    }

    if (!formState.price) {
      notification('Please input sell price', NotificationType.Error);
      setState(TransactionState.DISPLAY);
      return;
    }

    const price = formState.price * candyShop.baseUnitsPerCurrency;

    return candyShop
      .sell(
        new web3.PublicKey(nft.tokenAccountAddress),
        new web3.PublicKey(nft.tokenMintAddress),
        new BN(price),
        wallet
      )
      .then((txHash) => {
        console.log(
          'SellModal: Place sell order with transaction hash= ',
          txHash
        );
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.CONFIRMED);
        }, TIMEOUT_REFETCH_NFT);
      })
      .catch((err) => {
        console.log('SellModal: error= ', err);
        handleError(ErrorType.TransactionFailed);
        setState(TransactionState.DISPLAY);
      });
  };

  // Check active button submit
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setFormState((f) => ({ ...f, price: undefined }));
      return;
    }

    if (regex3Decimals.test(e.target.value)) {
      setFormState((f) => ({ ...f, price: +e.target.value }));
    }
  };

  const isSubmit = formState.price !== undefined;

  const onCloseModal = () => {
    onCancel();
    if (state === TransactionState.CONFIRMED) {
      setRefetch();
    }
  };

  return (
    <Modal onCancel={onCloseModal} width={600}>
      <div className="candy-sell-modal">
        {state === TransactionState.DISPLAY && (
          <div>
            <div className="candy-sell-modal-title">Sell</div>
            <div className="candy-sell-modal-content">
              <div className="candy-sell-modal-img">
                <LiqImage
                  src={nft?.nftImage}
                  alt={nft?.metadata?.data?.name}
                  fit="contain"
                />
              </div>
              <div>
                <div className="candy-sell-modal-nft-name">
                  {nft?.metadata?.data?.name}
                </div>
                <div className="candy-sell-modal-symbol">
                  {nft?.metadata?.data?.symbol}
                </div>
              </div>
            </div>
            <div className="candy-sell-modal-hr"></div>
            <form>
              <div className="candy-sell-modal-input-number">
                <input
                  placeholder="Price"
                  min={0}
                  onChange={onChangeInput}
                  type="number"
                  value={formState.price}
                />
                <span>{candyShop.currencySymbol}</span>
              </div>

              <div className="candy-sell-modal-transaction">
                <div>Transaction Fees</div>
                <div>1.0%</div>
              </div>

              <button
                className="candy-sell-modal-button candy-button"
                onClick={sell}
                disabled={!isSubmit}
              >
                List for Sale
              </button>
            </form>
          </div>
        )}
        {state === TransactionState.PROCESSING && (
          <Processing text="Listing your NFT" />
        )}
        {state === TransactionState.CONFIRMED && (
          <>
            <div className="candy-sell-modal-title">
              <IconTick />
            </div>
            <div className="candy-sell-modal-content">
              <div className="candy-sell-modal-img">
                <LiqImage src={nft?.nftImage} alt="NFT image" fit="contain" />
              </div>
              <div className="candy-sell-modal-listed">
                <span style={{ fontWeight: 'bold' }}>
                  {nft?.metadata?.data?.name}
                </span>{' '}
                is now listed for sale
              </div>
            </div>
            <div className="candy-sell-modal-hr"></div>
            <button
              className="candy-sell-modal-button candy-button"
              onClick={() => {
                onCancel();
                setRefetch();
              }}
            >
              Continue Browsing
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
