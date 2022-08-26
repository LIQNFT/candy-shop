import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
import { EthereumSDK } from '../../../core/sdk/.';

const sdk = new EthereumSDK();

const Cancel = () => {
  const { register, handleSubmit } = useForm();
  const [orderResult, setOrderResult] = useState<string>();

  const onSubmit = async (event: any) => {
    let accounts;
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('install metamask extension!!');
    }

    const { transactionHash } = await sdk.cancelOrder(window.ethereum, event.orderUuid, accounts[0]);

    setOrderResult(transactionHash);
  };

  return (
    <>
      <h2>Cancel Order</h2>
      <div className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Order Uuid</label>
          <input {...register('orderUuid', { required: true })} />
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

export default Cancel;
