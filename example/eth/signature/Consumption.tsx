import React, { useState } from 'react';
import { Button } from 'antd';
import { useForm } from 'react-hook-form';
import { EthereumSDK } from '../../../core/sdk/.';

const sdk = new EthereumSDK();

const Consumption = () => {
  const { register, handleSubmit } = useForm();
  // usetstate for storing and retrieving wallet details
  const [wallet, setWallet] = useState({
    address: ''
  });

  const [consumptionResult, setConsumptionResult] = useState();

  const btnhandler = () => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' }).then((res: any) => accountChangeHandler(res[0]));
    } else {
      alert('install metamask extension!!');
    }
  };

  const accountChangeHandler = (account: any) => {
    setWallet({
      address: account
    });
  };

  const onSubmit = async (event: any) => {
    let accounts;
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('install metamask extension!!');
    }
    const result = await sdk.makeOrderConsumptionSignature(window.ethereum, event.consumptionUuid, accounts[0]);
    setConsumptionResult(result);
  };

  return (
    <>
      <h2>Create Seller Consumption</h2>
      {/* Calling all values which we have stored in usestate */}{' '}
      <div className="text-center">
        <div>
          <strong>Address: </strong> {wallet.address}
        </div>
        <div>
          <Button onClick={btnhandler} variant="primary">
            {' '}
            Connect to wallet{' '}
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>consumptionUuid</label>
          <input {...register('consumptionUuid', { required: true })} />
          <br />
          <input type="submit" />
        </form>
        <div>
          <strong>Result: </strong>
          {JSON.stringify(consumptionResult, null, 2)}
        </div>
      </div>
    </>
  );
};

export default Consumption;
