import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EthNetwork } from '../../../core/sdk/.';

interface EthConnectionProps {
  publicKey?: string;
  setPublicKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  network: EthNetwork;
  setNetwork: React.Dispatch<React.SetStateAction<EthNetwork>>;
}
const EthConnectionContext = createContext<EthConnectionProps>({
  publicKey: undefined,
  setPublicKey: () => {},
  network: 'goerli',
  setNetwork: () => {}
});
import { providers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

import Web3Modal from 'web3modal';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: 'TODO'
    }
  }
};

export const EthConnectionProvider = ({ children }: { children: React.ReactElement }) => {
  const [publicKey, setPublicKey] = useState<string>();
  const [network, setNetwork] = useState<EthNetwork>('goerli');

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
    setPublicKey(userAddress);
  }, [web3Modal]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [web3Modal, connectWallet]);

  return (
    <EthConnectionContext.Provider value={{ publicKey, setPublicKey, network, setNetwork }}>
      {children}
    </EthConnectionContext.Provider>
  );
};

export const useEthConnection = () => useContext(EthConnectionContext);
