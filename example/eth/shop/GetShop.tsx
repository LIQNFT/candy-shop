import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
import { EthereumSDK } from '../../../core/sdk/.';

const sdk = new EthereumSDK();

const GetShop = () => {
  const { register, handleSubmit } = useForm();
  const [getShopResult, setGetShopResult] = useState();

  const onSubmit = async (data: any) => {
    const result = await sdk.getShop(data.uuid);
    setGetShopResult(result);
  };

  return (
    <>
      <h2>Get Shop (will get shops via data service instead)</h2>
      <div className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Shop uuid</label>
          <input {...register('uuid', { required: true })} />
          <br />
          <input type="submit" />
        </form>
      </div>
      <div>
        <strong>Result: </strong>
        {JSON.stringify(getShopResult, null, 2)}
      </div>
    </>
  );
};

export default GetShop;
