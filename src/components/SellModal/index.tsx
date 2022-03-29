import React, { useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

import { errorNotification } from '../../utils/notification';
import { SingleTokenInfo } from '../../api/fetchMetadata';
import { CandyShop } from '../../core/CandyShop';

import IconTick from '../../assets/IconTick';
import Processing from '../Processing/Processing';
import Modal from '../Modal';
import imgDefault from '../../assets/img-default.png';

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
  const [step, setStep] = useState(0);
  // const [modalRef, setModalRef] = useState<any>();

  // List for sale and move to next step
  const sell = async (e: any) => {
    e.stopPropagation();
    try {
      // Change to step 1: processing
      setStep(1);
      const price = (formState.price || 0) * LAMPORTS_PER_SOL;

      const txHash = await candyShop.sell(
        new PublicKey(nft.tokenAccountAddress),
        new PublicKey(nft.tokenMintAddress),
        new BN(price)
      );
      console.log('Place sell order with transaction hash', txHash);
      setStep(2);
    } catch (error) {
      // Show error and redirect to step 0 again
      console.log({ error });
      errorNotification(
        new Error('Transaction failed. Please try again later.')
      );
      setStep(0);
    }
  };

  // Check active button submit
  const onChangeInput = (e: React.FormEvent<HTMLInputElement>) => {
    setFormState((f) => ({ ...f, price: +e.target.value }));
  };

  const onCancel = useCallback(() => {
    onUnSelectItem();
    if (step === 2) setTimeout(() => window.location.reload(), 3_000);
  }, [step, onUnSelectItem]);

  const isSubmit = formState.price !== undefined;

  return (
    <Modal onCancel={onCancel}>
      {step === 0 && (
        <Content>
          <div className="candy-title">Sell</div>
          <div className="sell-modal-content">
            <img src={nft?.nftImage || imgDefault} alt="" />
            <div>
              <div className="sell-modal-collection-name">
                {nft?.metadata?.data?.symbol}
              </div>
              <div className="sell-modal-nft-name">
                {nft?.metadata?.data?.name}
              </div>
            </div>
          </div>
          <form>
            <InputNumber>
              <input
                placeholder="0.0"
                min={0}
                onChange={onChangeInput}
                type="number"
              />
              <span>SOL</span>
            </InputNumber>
            <Row>
              <div className="candy-footnote-label">Service Fees</div>
              <div className="candy-footnote-value">1.0%</div>
            </Row>

            <button
              className="candy-button"
              onClick={sell}
              disabled={!isSubmit}
            >
              List for Sale
            </button>
          </form>
        </Content>
      )}
      {step === 1 && <Processing text="Listing your NFT" />}
      {step === 2 && (
        <>
          <div className="candy-title">
            <IconTick />
          </div>
          <div className="sell-modal-content sell-modal-success">
            <img src={nft?.nftImage || imgDefault} alt="" />
            <div className="candy-title">
              {nft?.metadata?.data?.name} is now listed for sale
            </div>
          </div>
          <div className="sell-modal-success">
            <button className="candy-button" onClick={onCancel}>
              View listing
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

const InputNumber = styled.div`
  border: 2px solid gray;
  height: 40px;
  padding: 4px 8px;
  width: 100%;
  display: flex;
  border-radius: 4px;

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
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Content = styled.div`
  .sell-modal {
    img {
      margin: 0 20px;
      width: 100px;
    }
    &-success {
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    &-content {
      display: flex;
      padding-bottom: 40px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 60px;
    }
    &-collection-name {
    }
    &-nft-name {
      font-size: 20px;
      font-weight: 600;
    }

    &-success {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
  .candy-button {
    width: 100%;
  }
`;
