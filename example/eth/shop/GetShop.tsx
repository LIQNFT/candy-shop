import { useForm } from 'react-hook-form';
import React, { useState } from 'react';

const ETH_BACKEND_STAGING_URL = 'https://ckaho.liqnft.com/api/eth';

const GetShop = () => {
  const { register, handleSubmit } = useForm();
  const [getShopResult, setGetShopResult] = useState<any>();

  const onSubmit = async (data: any) => {
    const result = await fetch(`${ETH_BACKEND_STAGING_URL}/shop/${data.uuid}`).then((res) => res.json());
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
