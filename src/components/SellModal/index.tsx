import { BN } from '@project-serum/anchor';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
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

  // List for sale and move to next step
  const sell = async () => {
    let price = Number(form.getFieldValue('price')) * LAMPORTS_PER_SOL;

    const txHash = await candyShop.sell(
      new PublicKey(nft.tokenAccountAddress),
      new PublicKey(nft.tokenMintAddress),
      candyShop.treasuryMint(),
      new BN(price)
    );

    console.log('Place sell order with transaction hash', txHash);

    setStep(1);
  };

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
                {/* TODO: Possible to change this to antd InputNumber, set minimum value as 0 and remove the up/down arrow buttons on the right. Form can only be submitted with a valid number. */}
                <Input type="number" placeholder="0.0" suffix="SOL" />
              </Form.Item>
              <Row justify="space-between">
                <div className="candy-footnote-label">Service Fees</div>
                <div className="candy-footnote-value">1.0%</div>
              </Row>
              <Form.Item>
                {/* TODO: Implement the processing step when sell NFT is loading (can use the same screen as for buy saying "Listing your NFT...") If transaction fails, should return to step 0 and give error message. */}
                <button
                  onClick={sell}
                  disabled={!isSubmit}
                  className="candy-button"
                >
                  List for Sale
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
              {/* TODO: See if can global switch https://via.placeholder.com/300 to ../../assets/img-placeholder.jpg */}
              <img src={nft?.nftImage || 'https://via.placeholder.com/300'} />
              <div className="candy-title">
                { nft?.metadata?.data?.name } is now listed for sale
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
