import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EthereumSDK } from '../../../core/sdk/.';

const sdk = new EthereumSDK();

const CreateShop = () => {
  const [shopResult, setShopResult] = useState();
  const { register, handleSubmit } = useForm();
  const onSubmit = async (event: any) => {
    let accounts;
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('install metamask extension!!');
    }

    const result = await sdk.createShop(window.ethereum, event, accounts[0]);
    setShopResult(result.result);
  };

  return (
    <>
      <h2>Create Shop (to use in admin panel</h2>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Shop Name</label>
          <input {...register('name', { required: true })} />
          <br />
          <label>Shop logo url</label>
          <input {...register('logoUrl', { required: true })} />
          <br />
          <label>Seller percentage</label>
          <input {...register('percentage.seller', { required: true })} />
          <br />
          <label>Shop owner percentage</label>
          <input {...register('percentage.shopOwner', { required: true })} />
          <br />
          <label>Platform percentage</label>
          <input {...register('percentage.platform', { required: true })} />
          <br />
          <input type="submit" />
        </form>
      </div>
      <div>
        <strong>Result: </strong>
        {JSON.stringify(shopResult, null, 2)}
      </div>
    </>
  );
};

export default CreateShop;
