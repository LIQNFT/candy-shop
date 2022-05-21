import React, { createContext, ReactElement, useEffect, useState, Dispatch, SetStateAction, useContext } from 'react';

import { fetchShopStatusByShopAddress } from '@liqnft/candy-shop-sdk';
import { SingleBase, ShopStatus } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';

import { POLLING_SHOP_INTERVAL } from 'constant';
import { useInterval } from 'hooks/useInterval';
import { useCallback } from 'react';

const Logger = 'CandyShopDataValidator';

// Data context
interface ContextData {
  candyShopAddress?: web3.PublicKey;
  setCandyShopAddress: Dispatch<SetStateAction<web3.PublicKey | undefined>>;
}

export const CandyContext = createContext<ContextData>({
  candyShopAddress: undefined,
  setCandyShopAddress: () => console.log(`${Logger}: update CandyShopAddress`)
});

interface CandyProviderProps {
  children: ReactElement;
}

export const CandyShopDataValidator: React.FC<CandyProviderProps> = ({ children }) => {
  const [candyShopAddress, setCandyShopAddress] = useState<web3.PublicKey>();

  const polling = useCallback((candyShopAddress: web3.PublicKey) => {
    fetchShopStatusByShopAddress(candyShopAddress)
      .then((res: SingleBase<ShopStatus[]>) => {
        if (res.result) {
          for (const shopStatus of res.result) {
            const prevTimestamp = localStorage.getItem(shopStatus.type);
            const resTimestamp = JSON.stringify(shopStatus.timestamp);
            const isShopRefreshed = prevTimestamp !== resTimestamp;
            if (isShopRefreshed) {
              console.log(`${Logger}: ${shopStatus.type}`, prevTimestamp, res);
              localStorage.setItem(shopStatus.type, JSON.stringify(shopStatus.timestamp));
            }
          }
        } else {
          console.log(`${Logger}: fetchShopStatus res.result is undefined=`, res);
        }
      })
      .catch((err: any) => {
        console.log(`${Logger}: fetchShopStatus failed, error=`, err);
      });
  }, []);

  // polling update shop content
  useInterval(
    () => {
      if (!candyShopAddress) return;
      polling(candyShopAddress);
    },
    candyShopAddress ? POLLING_SHOP_INTERVAL : null
  );

  return <CandyContext.Provider value={{ candyShopAddress, setCandyShopAddress }}>{children}</CandyContext.Provider>;
};

export const useUpdateCandyShopContext: (candyShopProp?: web3.PublicKey) => ContextData = (candyShopProp) => {
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
