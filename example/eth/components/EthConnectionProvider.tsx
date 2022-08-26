import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { providers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import { Blockchain } from '../../../core/types/.';
import { EthWallet } from '../../../core/ui/.';

interface EthConnectionProps {
  address?: string;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  network: Blockchain;
  setNetwork: React.Dispatch<React.SetStateAction<Blockchain>>;
  web3Modal: Web3Modal;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const EthConnectionContext = createContext<EthConnectionProps>({
  address: undefined,
  setAddress: () => {},
  network: Blockchain.PolygonTestnet,
  setNetwork: () => {},
  web3Modal: new Web3Modal(),
  connectWallet: () => {},
  disconnectWallet: () => {}
});

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: 'https://mainnet.infura.io/v3/1cb569b43fef47e9b1f13dfa7090a935'
    }
  }
};

export const EthConnectionProvider = ({
  defaultNetwork,
  children
}: {
  defaultNetwork: Blockchain;
  children: React.ReactElement;
}) => {
  const [address, setAddress] = useState<string>(); // TODO: move eth wallet to context
  const [network, setNetwork] = useState<Blockchain>(defaultNetwork);

  const [web3Modal] = useState<Web3Modal>(
    () =>
      new Web3Modal({
        network,
        cacheProvider: true, // very important
        providerOptions
      })
  );

  const [ethWallet, setEthWallet] = useState<EthWallet>({ web3Modal, publicKey: '' });

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

export const useEthConnection = () => useContext(EthConnectionContext);
