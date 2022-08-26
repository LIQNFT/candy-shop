import React from 'react';
import { useEthConnection } from './EthConnectionProvider';

export const EthConnectButton: React.FC = () => {
  const { address, connectWallet, disconnectWallet } = useEthConnection();

  if (address) {
    return (
      <button className="ant-btn ant-btn-primary ant-btn-lg" onClick={disconnectWallet}>
        Disconnect
      </button>
    );
  }

  return (
    <button className="ant-btn ant-btn-primary ant-btn-lg" onClick={connectWallet}>
      Select Wallet
    </button>
  );
};
