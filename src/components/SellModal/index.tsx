import { Form, Input, Modal, Row, DatePicker } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import React, { useCallback, useMemo, useState } from 'react';
import IconLink from '../../assets/IconLink';
import IconTick from '../../assets/IconTick';
import IconTwitter from '../../assets/IconTwitter';

import './style.less';

const SellModal = ({ onCancel }: { onCancel: any }) => {
  /**
   * Step in here contains
   * 0: Content
   * 1: Done
   **/
  const [step, setStep] = useState(0);

  const [isSubmit, setIsSubmit] = useState(false);

  // Handle change step
  const onChangeStep = useCallback((step: number) => {
    setStep(step);
  }, []);

  // Handle form
  const [form] = Form.useForm();

  // Check active button submit
  const onValuesChange = useCallback((_, value) => {
    let isCheck = true;

    value.forEach((item: any) => {
      if (!item.value) isCheck = false;
    });

    setIsSubmit(isCheck);
  }, []);

  // Render header
  const headerComponent = useMemo(
    () =>
      new Map()
        .set(
          0,
          <>
            <div className="candy-title"> Sell</div>
            <div className="sell-modal-content">
              <img src="https://via.placeholder.com/300" />
              <div>
                <div>artist_name</div>
                <div className="candy-value">NFT_name</div>
              </div>
            </div>
          </>
        )
        .set(
          1,
          <>
            <div className="candy-title">
              <IconTick />
            </div>
            <div className="sell-modal-content">
              <img src="https://via.placeholder.com/300" />
              <div className="candy-title">
                Your item NFT_name is now listed for sale
              </div>
            </div>
          </>
        ),
    []
  );

  // Render view component
  const viewComponent = useMemo(
    () =>
      new Map()
        .set(
          0,
          <Form
            form={form}
            onFieldsChange={onValuesChange}
            className="candy-form"
            layout="vertical"
          >
            <FormItem label="Enter sell price" name="price" required>
              <Input placeholder="0.0" suffix="SOL" />
            </FormItem>
            <FormItem label="Duration" name="duration" required>
              <DatePicker.RangePicker />
            </FormItem>
            <Row justify="space-between">
              <div className="candy-label-input">Service Fees</div>
              <div>1.5%</div>
            </Row>
            <Form.Item>
              <button
                onClick={() => onChangeStep(1)}
                disabled={!isSubmit}
                className="candy-button"
              >
                {isSubmit ? 'Confirm' : 'Next'}
              </button>
            </Form.Item>
          </Form>
        )
        .set(
          1,
          <div className="sell-modal-success">
            <div className="candy-label-input">Share this listing</div>
            <div className="sell-modal-success-icon">
              <IconTwitter />
              <IconLink />
            </div>
            <button className="candy-button" onClick={onCancel}>
              View listing
            </button>
          </div>
        ),
    [onValuesChange, isSubmit]
  );

  return (
    <Modal
      onCancel={onCancel}
      visible
      className="candy-modal sell-modal"
      width={588}
      footer={null}
    >
      <div className="candy-container">
        {headerComponent.get(step)}
        {viewComponent.get(step)}
      </div>
    </Modal>
  );
};

export default SellModal;
