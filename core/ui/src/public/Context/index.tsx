import React, { createContext, ReactElement, useEffect, useState, Dispatch, SetStateAction, useContext } from 'react';

import { fetchShopStatusByShopAddress } from '@liqnft/candy-shop-sdk';
import { SingleBase, ShopStatus } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';

import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { POLLING_SHOP_TIMEOUT } from 'constant';

// Data context
type DataContextType = {
  candyShopAddress?: web3.PublicKey;
  setCandyShopAddress: Dispatch<SetStateAction<web3.PublicKey | undefined>>;
};

export const CandyContext = createContext<DataContextType>({
  candyShopAddress: undefined,
  setCandyShopAddress: () => console.log('update CandyShopAddress')
});

interface CandyProviderProps {
  children: ReactElement;
}

export const CandyShopDataValidator: React.FC<CandyProviderProps> = ({ children }) => {
  const [candyShopAddress, setCandyShopAddress] = useState<web3.PublicKey>();

  const timeoutRef = useUnmountTimeout();

  // polling update shop content
  useEffect(() => {
    if (!candyShopAddress) return;

    const pollingAction = () => {
      fetchShopStatusByShopAddress(candyShopAddress)
        .then((res: SingleBase<ShopStatus[]>) => {
          res.result.forEach((result) => {
            const prevTimestamp = localStorage.getItem(result.type);
            const resTimestamp = JSON.stringify(result.timestamp);
            const isShopRefreshed = prevTimestamp !== resTimestamp;
            if (isShopRefreshed) {
              console.log(`CandyShopDataValidator: ${result.type}`, prevTimestamp, res);
              localStorage.setItem(result.type, JSON.stringify(result.timestamp));
            }
          });
        })
        .catch((err: any) => {
          console.log('CandyShopDataValidator: fetchShopStatus failed, error=', err);
        });
    };

    const polling = () => {
      pollingAction();

      timeoutRef.current && clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(polling, POLLING_SHOP_TIMEOUT);
    };

    timeoutRef.current = setTimeout(polling, POLLING_SHOP_TIMEOUT);
  }, [candyShopAddress, timeoutRef]);

  return <CandyContext.Provider value={{ candyShopAddress, setCandyShopAddress }}>{children}</CandyContext.Provider>;
};

export const useUpdateCandyShopContext: (candyShopProp?: web3.PublicKey) => DataContextType = (candyShopProp) => {
  const context = useContext(CandyContext);
  if (!context) {
    throw new Error('useUpdateCandyShopContext must be used within a CandyShopDataValidator');
  }

  const { candyShopAddress, setCandyShopAddress } = context;

  // update candyShopAddress in context store
  useEffect(() => {
    if (!candyShopProp) return;
    setCandyShopAddress(candyShopProp);
  }, [candyShopAddress, candyShopProp, setCandyShopAddress]);

  return context;
};
