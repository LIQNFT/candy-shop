import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { Form, Input, Modal, Row } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { SingleTokenInfo } from '../../api/fetchMetadata';
import IconTick from '../../assets/IconTick';
import { CandyShop } from '../../core/CandyShop';
import './style.less';


export const SellModal = ({
  onCancel,
  nft,
  candyShop,
}: {
  onCancel: any;
  nft: SingleTokenInfo;
  candyShop: CandyShop;
}) => {
  /**
   * Step in here contains
   * 0: Content
   * 1: Done
   **/
  const [step, setStep] = useState(0);

  const [isSubmit, setIsSubmit] = useState(false);

  // Handle change step
  const onChangeStep = useCallback(
    (step: number, price: number) => async () => {
      const txHash = await candyShop.sell(
        new PublicKey(nft.tokenAccountAddress),
        new PublicKey(nft.tokenMintAddress),
        candyShop.treasuryMint(),
        new BN(price)
      );
      console.log('successfully placed sell order');
      console.log('txHash', txHash);
      setStep(step);
    },
    []
  );

  // Handle form
  const [form] = Form.useForm();

  // Check active button submit
  const onValuesChange = useCallback((_, values) => {
    setIsSubmit(values.every((item: any) => item.value));
  }, []);

  // Render view component
  const viewComponent = useMemo(
    () =>
      new Map()
        .set(
          0,
          <>
            <div className="candy-title">Sell</div>
            <div className="sell-modal-content">
              <img src={nft?.nftImage || 'https://via.placeholder.com/300'} />
              <div>
                <div className="sell-modal-collection-name">
                  {nft?.metadata?.data?.symbol}
                </div>
                <div className="sell-modal-nft-name">
                  {nft?.metadata?.data?.name}
                </div>
              </div>
            </div>
            <Form
              form={form}
              onFieldsChange={onValuesChange}
              className="candy-form"
              layout="vertical"
            >
              <Form.Item label="Sell price" name="price" required>
                <Input type="number" placeholder="0.0" suffix="SOL" />
              </Form.Item>
              <Row justify="space-between">
                <div className="candy-label-input">Service Fees</div>
                <div>1.0%</div>
              </Row>
              <Form.Item>
                <button
                  onClick={onChangeStep(1, 100000000)}
                  disabled={!isSubmit}
                  className="candy-button"
                >
                  {isSubmit ? 'Confirm' : 'Next'}
                </button>
              </Form.Item>
            </Form>
          </>
        )
        .set(
          1,
          <>
            <div className="candy-title">
              <IconTick />
            </div>
            <div className="sell-modal-content">
              <img src={nft?.nftImage || 'https://via.placeholder.com/300'} />
              <div className="candy-title">
                Your item NFT_name is now listed for sale
              </div>
            </div>
            <div className="sell-modal-success">
              {/*<div className="candy-label-input">Share this listing</div>
              <div className="sell-modal-success-icon">
                <IconTwitter />
                <IconLink />
              </div>*/}
              <button className="candy-button" onClick={onCancel}>
                View listing
              </button>
            </div>
          </>
        ),
    [onValuesChange, isSubmit, onCancel]
  );

  return (
    <Modal
      onCancel={onCancel}
      visible
      className="candy-shop-modal sell-modal"
      footer={null}
    >
      <div className="candy-container">{viewComponent.get(step)}</div>
    </Modal>
  );
};
