import { useForm } from 'react-hook-form';
import { EthereumSDK } from '../../../core/sdk/.';
import React, { useState } from 'react';

const sdk = new EthereumSDK();

const UpdateShop = () => {
  const [shopResult, setShopResult] = useState();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (event: any) => {
    let accounts;
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('install metamask extension!!');
    }

    const result = await sdk.updateShop(window.ethereum, event, accounts[0]);
    setShopResult(result.result);
  };

  return (
    <>
      <h2>Update Shop (to use in admin panel)</h2>
      <div className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Shop Uuid</label>
          <input {...register('uuid', { required: true })} />
          <br />
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

export default UpdateShop;
