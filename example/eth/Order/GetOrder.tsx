import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
import { EthereumSDK } from '../../../core/sdk/.';

const sdk = new EthereumSDK();

const GetOrder = () => {
  const { register, handleSubmit } = useForm();
  const [orderResult, setOrderResult] = useState();

  const onSubmit = async (event: any) => {
    const result = await sdk.getOrder(event.uuid);
    setOrderResult(result);
  };

  return (
    <>
      <h2>Get Order (note: will use data-service API to retrieve orders instead)</h2>
      <div className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Order Uuid</label>
          <input {...register('uuid', { required: true })} />
          <br />
          <input type="submit" />
        </form>
      </div>
      <div>
        <strong>Result: </strong>
        {JSON.stringify(orderResult, null, 2)}
      </div>
    </>
  );
};

export default GetOrder;
