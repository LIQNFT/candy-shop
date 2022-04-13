import React from 'react';
import styled from '@emotion/styled';

import { CandyShop } from 'core/CandyShop';
import { useState } from 'react';
import { web3 } from '@project-serum/anchor';
import { notification } from 'utils/rc-notification';

export interface WhitelistModalProps {
  onChangeStep: (...arg: any) => void;
  onAddSuccess: (...arg: any) => void;
  signMessage?: (...arg: any) => Promise<Uint8Array>;
  candyShop: CandyShop;
  walletPublicKey: web3.PublicKey | undefined;
}

export const WhitelistForm: React.FC<WhitelistModalProps> = ({
  onChangeStep,
  candyShop,
  signMessage,
  walletPublicKey,
  onAddSuccess,
}) => {
  const [addresses, setAddresses] = useState<any>({});

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    setAddresses((obj: any) => {
      obj[id] = value;
      return obj;
    });
  };

  const onAddWhitelist = async () => {
    if (!signMessage || !walletPublicKey) return;
    const message = { mintAddress: Object.values(addresses) };
    const messageB64 = Buffer.from(JSON.stringify(message));
    const signature = await signMessage(messageB64);
    if (!signature) return;

    onChangeStep(1);
    const body = {
      signature: Buffer.from(signature).toString('base64'),
      message: messageB64.toString('base64'),
      publicKey: walletPublicKey.toBuffer().toString('base64'),
    };
    candyShop
      .addWhitelistToShop(body)
      .then((data: any) => {
        if (data.data.success === false) {
          notification('Transaction failed. Please try again later.', 'error');
          onChangeStep(0);
          return;
        }

        onAddSuccess(data.data.result[0]);
        onChangeStep(2);
        notification('Add whitelist successfully.', 'success');
      })
      .catch(() => {
        notification('Transaction failed. Please try again later.', 'error');
        onChangeStep(0);
      });
  };

  return (
    <Content>
      <div className="cds-wl-title">Whitelist Collections</div>
      <p className="cds-wl-description">{DESCRIPTION}</p>

      <InputWrap>
        <span>Mint Address</span>
        <input id="wl-address-0" onChange={onChange} />
      </InputWrap>

      <Button className="candy-button" onClick={onAddWhitelist}>
        Verify address
      </Button>
    </Content>
  );
};

const DESCRIPTION =
  'Max. 10 collections can be whitelisted for sale on your candy shop. Please provide the mint addresses for each collections.';

const Content = styled.div`
  padding: 40px 20px 10px;
  display: flex;
  align-items: center;
  flex-direction: column;

  .cds-wl {
    &-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    &-description {
      font-weight: 700;
    }
  }
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
  width: 100%;

  span {
    font-size: 10px;
    font-weight: 600;
  }

  input {
    border: 1px solid #bdbdbd;
    outline: none;
    flex-grow: 1;
    border-radius: 4px;
    padding: 8px 4px;
  }
`;

const Button = styled.div`
  text-align: center;
  padding: 6px 0;
  margin-top: 20px;
  font-weight: 700;
  width: 100%;
`;
