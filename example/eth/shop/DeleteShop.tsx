import React from 'react';
import { useForm } from 'react-hook-form';
import { EthereumSDK } from '../../../core/sdk/.';

const sdk = new EthereumSDK();

const DeleteShop = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (event: any) => {
    let accounts;
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('install metamask extension!!');
    }
    await sdk.deleteShop(window.ethereum, event, accounts[0]);
  };

  return (
    <>
      <h2>Delete Shop (will not use)</h2>
      <div className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Shop Uuid</label>
          <input {...register('uuid', { required: true })} />
          <br />
          <input type="submit" />
        </form>
      </div>
    </>
  );
};

export default DeleteShop;
