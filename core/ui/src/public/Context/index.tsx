import React, { createContext, ReactElement, useMemo, useReducer } from 'react';

type DataContextType = {
  refetch: number;
};

export const CandyContext = createContext<DataContextType>({
  refetch: 0
});

type ActionContextType = {
  setRefetch: () => void;
};

export const CandyActionContext = createContext<ActionContextType>({
  setRefetch: () => console.log('no setRefetch')
});

interface CandyProviderProps {
  children: ReactElement;
}

export const CandyShopDataValidator: React.FC<CandyProviderProps> = ({ children }) => {
  const [refetch, setRefetch] = useReducer((s) => s + 1, 0);
  const actions = useMemo(() => ({ setRefetch }), []);

  console.log('REVALIDATE NFT', refetch);
  return (
    <CandyContext.Provider value={{ refetch }}>
      <CandyActionContext.Provider value={actions}>{children}</CandyActionContext.Provider>
    </CandyContext.Provider>
  );
};
