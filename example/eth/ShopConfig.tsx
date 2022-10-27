import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from 'antd';
import { ETH_LS_CANDY_FORM, ETH_DEFAULT_FORM_CONFIG } from './constants/formConfig';
import { chains } from './constants/chains';

interface ShopConfigProps {
  setCandyForm: (candyForm: any) => any;
  candyForm: any;
}

enum InputType {
  CREATOR_ADDRESS = 'CREATOR_ADDRESS',
  TREASURY_MINT = 'TREASURY_MINT',
  PROGRAM_ID = 'PROGRAM_ID',
  SETTINGS = 'SETTINGS',
  PAYMENT_PROVIDER = 'PAYMENT_PROVIDER'
}

export const ShopConfig: React.FC<ShopConfigProps> = ({ setCandyForm, candyForm }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [creatorAddressInput, setCreatorAddressInput] = useState<string>(ETH_DEFAULT_FORM_CONFIG.creatorAddress);
  const [treasuryMintInput, setTreasuryMintInput] = useState<string>(ETH_DEFAULT_FORM_CONFIG.treasuryMint);
  const [programIdInput, setProgramIdInput] = useState<string>(ETH_DEFAULT_FORM_CONFIG.programId);
  const [networkInput, setNetworkInput] = useState<string>(ETH_DEFAULT_FORM_CONFIG.network);
  const [settingsInput, setSettingsInput] = useState<string>(ETH_DEFAULT_FORM_CONFIG.settings);
  const [paymentProviderObject, setPaymentProviderObject] = useState<string>(ETH_DEFAULT_FORM_CONFIG.paymentProvider);

  const onCreateNewCandyShop = () => {
    const data = {
      creatorAddress: creatorAddressInput,
      treasuryMint: treasuryMintInput,
      programId: programIdInput,
      network: networkInput,
      settings: settingsInput,
      paymentProvider: paymentProviderObject
    };
    setCandyForm(data);
    localStorage.setItem(ETH_LS_CANDY_FORM, JSON.stringify(data));
    setIsModalVisible(false);
  };

  const onReset = () => {
    onUpdateFormState(ETH_DEFAULT_FORM_CONFIG);
  };

  const onUpdateFormState = useCallback((data) => {
    const { treasuryMint, creatorAddress, programId, network, settings, paymentProvider } = data;
    setCreatorAddressInput(creatorAddress);
    setTreasuryMintInput(treasuryMint);
    setProgramIdInput(programId);
    setNetworkInput(network);
    setSettingsInput(settings);
    setPaymentProviderObject(paymentProvider);
  }, []);

  const handleInputChange = (e: any, type: InputType) => {
    switch (type) {
      case InputType.CREATOR_ADDRESS: {
        setCreatorAddressInput(e.target.value);
        break;
      }
      case InputType.TREASURY_MINT: {
        setTreasuryMintInput(e.target.value);
        break;
      }
      case InputType.SETTINGS: {
        setSettingsInput(e.target.value);
        break;
      }
      case InputType.PROGRAM_ID: {
        setProgramIdInput(e.target.value);
        break;
      }
      case InputType.PAYMENT_PROVIDER: {
        setPaymentProviderObject(e.target.value);
        break;
      }
      default: {
        break;
      }
    }
  };

  useEffect(() => {
    if (candyForm) onUpdateFormState(candyForm);
  }, [candyForm]);

  return (
    <>
      <Button type="default" size="large" style={{ marginRight: 8 }} onClick={() => setIsModalVisible(true)}>
        Config
      </Button>
      <Modal
        visible={isModalVisible}
        title="Configure Candy Shop"
        onCancel={() => setIsModalVisible(false)}
        onOk={onCreateNewCandyShop}
        footer={[
          <Button key="reset" type="primary" ghost onClick={onReset}>
            Reset
          </Button>,
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={onCreateNewCandyShop}>
            OK
          </Button>
        ]}
      >
        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Candy Shop Creator Address</div>
        <Input
          style={{ marginBottom: 15 }}
          placeholder="Candy Shop Creator Address"
          value={creatorAddressInput}
          onChange={(e) => handleInputChange(e, InputType.CREATOR_ADDRESS)}
        />

        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Candy Shop Treasury Mint</div>
        <Input
          style={{ marginBottom: 15 }}
          placeholder="Candy Shop Treasury Mint"
          value={treasuryMintInput}
          onChange={(e) => handleInputChange(e, InputType.TREASURY_MINT)}
        />

        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Candy Shop Program Id</div>
        <Input
          style={{ marginBottom: 15 }}
          placeholder="Candy Shop Program Id"
          value={programIdInput}
          onChange={(e) => handleInputChange(e, InputType.PROGRAM_ID)}
        />

        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Network</div>
        <Select
          defaultValue={chains.polygonMumbai.network}
          onChange={setNetworkInput}
          style={{ width: '100%', marginBottom: 15 }}
          value={networkInput}
        >
          <Select.Option value={chains.mainnet.network}>{chains.mainnet.name}</Select.Option>
          <Select.Option value={chains.goerli.network}>{chains.goerli.name}</Select.Option>
          <Select.Option value={chains.polygon.network}>{chains.polygon.name}</Select.Option>
          <Select.Option value={chains.polygonMumbai.network}>{chains.polygonMumbai.name}</Select.Option>
        </Select>

        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Candy Shop Settings</div>
        <Input.TextArea
          rows={3}
          placeholder="Candy Shop Settings"
          value={settingsInput}
          onChange={(e) => handleInputChange(e, InputType.SETTINGS)}
        />
        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Candy Shop Payment Provider</div>
        <Input.TextArea
          rows={3}
          placeholder="Candy Shop Payment Provider object"
          value={paymentProviderObject}
          onChange={(e) => handleInputChange(e, InputType.PAYMENT_PROVIDER)}
        />
      </Modal>
    </>
  );
};
