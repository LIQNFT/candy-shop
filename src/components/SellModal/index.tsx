import { BN } from '@project-serum/anchor';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Form, Input, InputNumber, Modal, Row } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { errorNotification } from '../../utils/notification';
import { SingleTokenInfo } from '../../api/fetchMetadata';
import IconTick from '../../assets/IconTick';
import imgDefault from '../../assets/img-default.png';
import { CandyShop } from '../../core/CandyShop';
import Processing from '../Processing/Processing';

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
   * 1: Processing
   * 2: Done
   **/
  const [step, setStep] = useState(0);

  const [isSubmit, setIsSubmit] = useState(false);

  // List for sale and move to next step
  const sell = async () => {
    try {
      // Change to step 1: processing
      setStep(1);

      let price = form.getFieldValue('price') * LAMPORTS_PER_SOL;

      const txHash = await candyShop.sell(
        new PublicKey(nft.tokenAccountAddress),
        new PublicKey(nft.tokenMintAddress),
        candyShop.treasuryMint(),
        new BN(price)
      );

      console.log('Place sell order with transaction hash', txHash);
      setStep(2);
    } catch (error) {
      // Show error and redirect to step 0 again
      errorNotification(
        new Error('Transaction failed. Please try again later.')
      );
      setStep(0);
    }
  };

  // Handle form
  const [form] = Form.useForm();

  // Check active button submit
  const onValuesChange = useCallback((_, values) => {
    setIsSubmit(values.every((item: any) => item.value || item.value === 0));
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
              <img src={nft?.nftImage || imgDefault} />
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
              <Form.Item
                label="Sell price"
                name="price"
                required
                rules={[
                  () => ({
                    validator(_, value) {
                      if (value >= 0) return Promise.resolve();

                      return Promise.reject(
                        new Error('Price must be bigger than 0.')
                      );
                    },
                  }),
                ]}
              >
                <InputNumber
                  placeholder="0.0"
                  addonAfter="SOL"
                  min={0}
                />
              </Form.Item>
              <Row justify="space-between">
                <div className="candy-footnote-label">Service Fees</div>
                <div className="candy-footnote-value">1.0%</div>
              </Row>

              <Form.Item>
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
        .set(1, <Processing text="Listing your NFT" />)
        .set(
          2,
          <>
            <div className="candy-title">
              <IconTick />
            </div>
            <div className="sell-modal-content">
              <img src={nft?.nftImage || imgDefault} />
              <div className="candy-title">
                {nft?.metadata?.data?.name} is now listed for sale
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
