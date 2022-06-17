import React, {
  createContext,
  ReactElement,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
  useCallback
} from 'react';

import { fetchShopStatusByShopAddress } from '@liqnft/candy-shop-sdk';
import { SingleBase, ShopStatus, ShopStatusType } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';

import { POLLING_SHOP_INTERVAL } from 'constant';
import { useInterval } from 'hooks/useInterval';

const Logger = 'CandyShopUI/CandyShopDataValidator';

// Data context
interface ContextData {
  candyShopAddress?: web3.PublicKey;
  setCandyShopAddress: Dispatch<SetStateAction<web3.PublicKey | undefined>>;
  setSubjects: Dispatch<SetStateAction<any>>;
}

interface CandyProviderProps {
  children: ReactElement;
}

type Subject = { [key in ShopStatusType]?: number };

export const CandyContext = createContext<ContextData | null>(null);

export const CandyShopDataValidator: React.FC<CandyProviderProps> = ({ children }) => {
  const [candyShopAddress, setCandyShopAddress] = useState<web3.PublicKey>();
  /**
   * subject will be increase when some components need to check status is rendered on UI.
   * if subject value is 0: it means we don't need to check status for that subject.
   * */

  const [subjects, setSubjects] = useState<Subject>({
    [ShopStatusType.Order]: 0,
    [ShopStatusType.Trade]: 0,
    [ShopStatusType.Auction]: 0
  });

  const polling = useCallback(
    (candyShopAddress: web3.PublicKey) => {
      const targets: ShopStatusType[] = [];
      let key: keyof Subject;
      for (key in subjects) {
        if (Number(subjects[key]) > 0) targets.push(key);
      }

      if (targets.length === 0) return;
      fetchShopStatusByShopAddress(candyShopAddress, { targets })
        .then((res: SingleBase<ShopStatus[]>) => {
          if (res.result) {
            for (const shopStatus of res.result) {
              const prevTimestamp = localStorage.getItem(shopStatus.type);
              const resTimestamp = JSON.stringify(shopStatus.timestamp);
              const isShopRefreshed = prevTimestamp !== resTimestamp;
              if (isShopRefreshed) {
                console.log(`%c${Logger}: ${shopStatus.type}`, 'color: #e9ae00', prevTimestamp, res);
                localStorage.setItem(shopStatus.type, JSON.stringify(shopStatus.timestamp));
              }
            }
          } else {
            console.log(`${Logger}: fetchShopStatus res.result is undefined`);
          }
        })
        .catch((err: any) => {
          console.log(`${Logger}: fetchShopStatus failed, error=`, err);
        });
    },
    [subjects]
  );

  // polling update shop content
  useInterval(
    () => {
      if (!candyShopAddress) return;
      polling(candyShopAddress);
    },
    candyShopAddress ? POLLING_SHOP_INTERVAL : null
  );

  return (
    <CandyContext.Provider value={{ candyShopAddress, setCandyShopAddress, setSubjects }}>
      {children}
    </CandyContext.Provider>
  );
};

export const useUpdateCandyShopContext: (candyShopAddress?: web3.PublicKey) => ContextData = (candyShopAddress) => {
  const context = useContext(CandyContext);
  if (!context) {
    throw new Error('useUpdateCandyShopContext must be used within a CandyShopDataValidator');
  }

  const { setCandyShopAddress } = context;

  // update candyShopAddress in context store
  useEffect(() => {
    if (!candyShopAddress) return;
    setCandyShopAddress(candyShopAddress);
  }, [candyShopAddress, setCandyShopAddress]);

  return context;
};

export const useUpdateSubject = (subject: ShopStatusType, candyShopAddress?: web3.PublicKey): void => {
  const { setSubjects } = useUpdateCandyShopContext(candyShopAddress);

  useEffect(() => {
    if (!subject) return;

    setSubjects((obj: Subject) => ({ ...obj, [subject]: (obj[subject] || 0) + 1 }));
    return () => {
      setSubjects((obj: Subject) => ({ ...obj, [subject]: (obj[subject] || 0) - 1 }));
    };
  }, [setSubjects, subject]);
};
