import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EthereumSDK } from '../../../core/sdk/.';

const sdk = new EthereumSDK();

const Allowance = () => {
  const { register, handleSubmit } = useForm();
  const [allowanceResult, setAllowanceResult] = useState<string>();

  const onSubmit = async (event: any) => {
    let accounts;
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('install metamask extension!!');
    }

    const { transactionHash } = await sdk.makeConsumptionAllowance(window.ethereum, event.consumptionUuid, accounts[0]);

    setAllowanceResult(transactionHash);
  };

  return (
    <>
      <h2>Create Buyer Allowance</h2>
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

export default Allowance;
