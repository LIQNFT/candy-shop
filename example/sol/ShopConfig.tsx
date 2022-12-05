import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from 'antd';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { LS_CANDY_FORM, DEFAULT_FORM_CONFIG } from './constants/formConfig';
import { SolShopInitParams, CandyShop } from '../../core/sdk/.';
interface ShopConfigProps {
  onSetCandyShop: (cs: CandyShop | null) => void;
}

enum InputType {
  CREATOR_ADDRESS = 'CREATOR_ADDRESS',
  TREASURY_MINT = 'TREASURY_MINT',
  PROGRAM_ID = 'PROGRAM_ID',
  SETTINGS = 'SETTINGS',
  PAYMENT_PROVIDER = 'PAYMENT_PROVIDER'
}

export const ShopConfig: React.FC<ShopConfigProps> = ({ onSetCandyShop }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [creatorAddressInput, setCreatorAddressInput] = useState<string>(DEFAULT_FORM_CONFIG.creatorAddress);
  const [treasuryMintInput, setTreasuryMintInput] = useState<string>(DEFAULT_FORM_CONFIG.treasuryMint);
  const [programIdInput, setProgramIdInput] = useState<string>(DEFAULT_FORM_CONFIG.programId);
  const [networkInput, setNetworkInput] = useState<string>(DEFAULT_FORM_CONFIG.network);
  const [settingsInput, setSettingsInput] = useState<string>(DEFAULT_FORM_CONFIG.settings);
  const [paymentProviderObject, setPaymentProviderObject] = useState<string>(DEFAULT_FORM_CONFIG.paymentProvider);

  const [candyForm, setCandyForm] = useState(() => {
    const formLocalStorage = localStorage.getItem(LS_CANDY_FORM);
    if (formLocalStorage) return JSON.parse(formLocalStorage);
    return DEFAULT_FORM_CONFIG;
  });

  useEffect(() => {
    if (!candyForm.creatorAddress) return;

    const params: SolShopInitParams = {
      shopCreatorAddress: candyForm.creatorAddress,
      treasuryMint: candyForm.treasuryMint,
      programId: candyForm.programId,
      env: candyForm.network,
      settings: JSON.parse(candyForm.settings)
    };

    CandyShop.initSolCandyShop(params)
      .then((candyShop) => {
        onSetCandyShop(candyShop);
      })
      .catch((error: Error) => {
        onSetCandyShop(null);
        console.log('CandyShop.initSolCandyShop failed, error=', error);
      });
  }, [candyForm, onSetCandyShop]);

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
    localStorage.setItem(LS_CANDY_FORM, JSON.stringify(data));
    setIsModalVisible(false);
  };

  const onReset = () => {
    onUpdateFormState(DEFAULT_FORM_CONFIG);
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
      case InputType.PROGRAM_ID: {
        setProgramIdInput(e.target.value);
        break;
      }
      case InputType.SETTINGS: {
        setSettingsInput(e.target.value);
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

  const handleSelectChange = (value: string) => {
    setNetworkInput(value);
  };

  useEffect(() => {
    if (candyForm) onUpdateFormState(candyForm);
  }, [candyForm, onUpdateFormState]);

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

        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Candy Shop Program ID</div>
        <Input
          style={{ marginBottom: 15 }}
          placeholder="Candy Shop Program ID"
          value={programIdInput}
          onChange={(e) => handleInputChange(e, InputType.PROGRAM_ID)}
        />

        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Network</div>
        <Select
          defaultValue={WalletAdapterNetwork.Devnet}
          onChange={handleSelectChange}
          style={{ width: '100%', marginBottom: 15 }}
          value={networkInput}
        >
          <Select.Option value={WalletAdapterNetwork.Devnet}>devnet</Select.Option>
          <Select.Option value={WalletAdapterNetwork.Mainnet}>mainnet-beta</Select.Option>
        </Select>

        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500 }}>Candy Shop Settings</div>
        <Input.TextArea
          rows={5}
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
