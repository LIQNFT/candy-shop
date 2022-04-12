import styled from '@emotion/styled';
import { BN, web3 } from '@project-serum/anchor';
import { SingleTokenInfo } from 'api/fetchMetadata';
import IconTick from 'assets/IconTick';
import Modal from 'components/Modal';
import Processing from 'components/Processing';
import { CandyShop } from 'core/CandyShop';
import React, { useCallback, useState } from 'react';
import { notification } from 'utils/rc-notification';
import { TransactionState } from '../../model';
import { LiqImage } from '../LiqImage';

import './style.less';

export interface SellModalProps {
  onCancel: any;
  nft: SingleTokenInfo;
  candyShop: CandyShop;
}

export const SellModal: React.FC<SellModalProps> = ({
  onCancel: onUnSelectItem,
  nft,
  candyShop,
}: SellModalProps) => {
  const [formState, setFormState] = useState<{ price: number | undefined }>({
    price: undefined,
  });
  const [step, setStep] = useState(TransactionState.DISPLAY);

  // List for sale and move to next step
  const sell = async () => {
    setStep(TransactionState.PROCESSING);

    if (!formState.price) {
      notification('Please input sell price', 'error');
      setStep(TransactionState.DISPLAY);
      return;
    }

    const price = formState.price * web3.LAMPORTS_PER_SOL;

    return candyShop
      .sell(
        new web3.PublicKey(nft.tokenAccountAddress),
        new web3.PublicKey(nft.tokenMintAddress),
        new BN(price)
      )
      .then((txHash) => {
        console.log('Place sell order with transaction hash', txHash);
        setStep(TransactionState.CONFIRMED);
      })
      .catch((err) => {
        // Show error and redirect to step 0 again
        console.log({ err });
        notification('Transaction failed. Please try again later.', 'error');
        setStep(TransactionState.DISPLAY);
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

  const onCancel = useCallback(() => {
    onUnSelectItem();
    if (step === 2) setTimeout(() => window.location.reload(), 3_000);
  }, [step, onUnSelectItem]);

  const isSubmit = formState.price !== undefined;

  return (
    <Modal onCancel={onCancel} width={600}>
      <div className="sell-modal">
        {step === TransactionState.DISPLAY && (
          <Content>
            <div className="sell-modal-title">Sell</div>
            <div className="sell-modal-content">
              <div className="sell-modal-img">
                <LiqImage
                  src={nft?.nftImage}
                  alt="NFT image"
                  style={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
                />
              </div>
              <div>
                <div className="sell-modal-nft-name">
                  {nft?.metadata?.data?.name}
                </div>
                <div className="sell-modal-symbol">
                  {nft?.metadata?.data?.symbol}
                </div>
              </div>
            </div>
            <div className="sell-modal-hr"></div>
            <form>
              <InputNumber>
                <input
                  placeholder="Price"
                  min={0}
                  onChange={onChangeInput}
                  type="number"
                  value={formState.price}
                />
                <span>SOL</span>
              </InputNumber>

              <Row>
                <div>Transaction Fees</div>
                <div>1.0%</div>
              </Row>

              <button
                className="sell-modal-button"
                onClick={sell}
                disabled={!isSubmit}
              >
                List for Sale
              </button>
            </form>
          </Content>
        )}
        {step === TransactionState.PROCESSING && (
          <Processing text="Listing your NFT" />
        )}
        {step === TransactionState.CONFIRMED && (
          <>
            <div className="sell-modal-title">
              <IconTick />
            </div>
            <div className="sell-modal-content">
              <div className="sell-modal-img">
                <LiqImage
                  src={nft?.nftImage}
                  alt="NFT image"
                  style={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
                />
              </div>
              <div className="sell-modal-listed">
                <span style={{ fontWeight: 'bold' }}>
                  {nft?.metadata?.data?.name}
                </span>{' '}
                is now listed for sale
              </div>
            </div>
            <div className="sell-modal-hr"></div>
            <button className="sell-modal-button" onClick={onCancel}>
              Continue Browsing
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

const regex3Decimals = new RegExp('^[0-9]{1,11}(?:.[0-9]{1,3})?$');

const InputNumber = styled.div`
  width: 100%;
  height: 40px;
  padding: 4px 8px;
  display: flex;
  align-items: center;

  border-radius: 4px;
  border: 2px solid #bdbdbd;

  input {
    border: none;
    outline: none;
    flex-grow: 1;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    &[type='number'] {
      -moz-appearance: textfield;
    }
  }
`;

const Row = styled.div`
  font-size: 14px;

  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Content = styled.div``;
