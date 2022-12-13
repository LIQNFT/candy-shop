import React, { createContext, ReactElement, useState, Dispatch, SetStateAction, useContext, useEffect } from 'react';
import { SocketProvider } from './Socket';

import { Blockchain } from '@liqnft/candy-shop-types';

// Data context
interface ContextData {
  candyShopAddress?: string;
  setCandyShopAddress: Dispatch<SetStateAction<string | undefined>>;
  setNetwork: Dispatch<SetStateAction<Blockchain | undefined>>;
}

interface CandyProviderProps {
  children: ReactElement;
}

export const CandyContext = createContext<ContextData | null>(null);

export const CandyShopDataValidator: React.FC<CandyProviderProps> = ({ children }) => {
  const [candyShopAddress, setCandyShopAddress] = useState<string>();
  const [network, setNetwork] = useState<Blockchain>();

  return (
    <CandyContext.Provider value={{ candyShopAddress, setCandyShopAddress, setNetwork }}>
      <SocketProvider network={network} candyShopAddress={candyShopAddress}>
        {children}
      </SocketProvider>
    </CandyContext.Provider>
  );
};

export const useUpdateCandyShopContext: ({
  candyShopAddress,
  network
}: {
  candyShopAddress?: string;
  network: Blockchain;
}) => ContextData = ({ candyShopAddress, network }) => {
  const context = useContext(CandyContext);
  if (!context) {
    throw new Error('useUpdateCandyShopContext must be used within a CandyShopDataValidator');
  }

  const { setCandyShopAddress, setNetwork } = context;

  useEffect(() => {
    if (!candyShopAddress) return;
    setCandyShopAddress(candyShopAddress);
  }, [candyShopAddress, setCandyShopAddress]);

  useEffect(() => {
    if (network) setNetwork(network);
  }, [network, setNetwork]);

  return context;
};

export const useCandyContext = (): ContextData => useContext(CandyContext) as ContextData;
