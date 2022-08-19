import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EthereumSDK } from '../../../core/sdk/.';

const sdk = new EthereumSDK();

const OrderOfferAllowance = () => {
  const { register, handleSubmit } = useForm();
  const [allowanceResult, setAllowanceResult] = useState<string>();

  const onSubmit = async (event: any) => {
    // event.preventDefault();
    let accounts;
    if (window.ethereum) {
      // res[0] for fetching a first wallet
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('install metamask extension!!');
    }

    const { transactionHash } = await sdk.makeConsumptionAllowance(window.ethereum, event.consumptionUuid, accounts[0]);

    setAllowanceResult(transactionHash);
  };

  return (
    <>
      <h2>Create Seller Allowance (check if can remove as same method as create buyer allowance)</h2>
      {/* Calling all values which we have stored in usestate */}{' '}
      <div className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Consumption uuid</label>
          <input {...register('consumptionUuid', { required: true })} />
          <br />
          <input type="submit" />
        </form>
        <div>
          <strong>Result: </strong>
          {JSON.stringify(allowanceResult, null, 2)}
        </div>
      </div>
    </>
  );
};

export default OrderOfferAllowance;
