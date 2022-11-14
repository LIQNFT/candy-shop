import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { providers } from 'ethers';
import Web3Modal from 'web3modal';
import { Blockchain } from '../../../core/types/.';

interface EthConnectionData {
  address?: string;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  network: Blockchain;
  setNetwork: React.Dispatch<React.SetStateAction<Blockchain>>;
  web3Modal: Web3Modal;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const DEFAULT_CONTEXT_FUNCTION = () => {
  //
};

const EthConnectionContext = createContext<EthConnectionData>({
  address: undefined,
  setAddress: DEFAULT_CONTEXT_FUNCTION,
  network: Blockchain.PolygonTestnet,
  setNetwork: DEFAULT_CONTEXT_FUNCTION,
  web3Modal: new Web3Modal(),
  connectWallet: DEFAULT_CONTEXT_FUNCTION,
  disconnectWallet: DEFAULT_CONTEXT_FUNCTION
});

export const EthConnectionProvider: React.FC<{
  defaultNetwork: Blockchain;
  children: React.ReactElement;
}> = ({ defaultNetwork, children }) => {
  const [address, setAddress] = useState<string>(); // TODO: move eth wallet to context
  const [network, setNetwork] = useState<Blockchain>(defaultNetwork);

  const [web3Modal] = useState<Web3Modal>(
    () =>
      new Web3Modal({
        network,
        cacheProvider: true, // very important
        providerOptions: {}
      })
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
  }, [web3Modal, connectWallet]);

  return (
    <EthConnectionContext.Provider
      value={{
        address,
        setAddress,
        network,
        setNetwork,
        web3Modal,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </EthConnectionContext.Provider>
  );
};

export const useEthConnection = (): EthConnectionData => useContext(EthConnectionContext);
