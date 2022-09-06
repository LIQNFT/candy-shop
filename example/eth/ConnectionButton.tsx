import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { providers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: 'TODO'
    }
  }
};
const network = 'goerli';
export const EthConnectionButton: React.FC = () => {
  const [address, setAddress] = useState('');

  const web3Modal = useMemo(
    () =>
      new Web3Modal({
        network: network,
        cacheProvider: true, // very important
        providerOptions
      }),
    []
  );

  const connectWallet = useCallback(async () => {
    const provider = await web3Modal.connect();
    const ethersProvider = new providers.Web3Provider(provider);
    const userAddress = await ethersProvider.getSigner().getAddress();
    setAddress(userAddress);
  }, [web3Modal]);

  const disconnectWallet = async () => {
    web3Modal.clearCachedProvider();
    setAddress('');
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [connectWallet, web3Modal]);

  if (address) {
    return (
      <button className="candy-button" onClick={disconnectWallet}>
        Disconnect
      </button>
    );
  }
  return (
    <button className="candy-button" onClick={connectWallet}>
      Connected
    </button>
  );
};
