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

import { POLLING_SHOP_INTERVAL } from 'constant';
import { useInterval } from 'hooks/useInterval';

const Logger = 'CandyShopUI/CandyShopDataValidator';

// Data context
interface ContextData {
  candyShopAddress?: string;
  setCandyShopAddress: Dispatch<SetStateAction<string | undefined>>;
  setSubjects: Dispatch<SetStateAction<any>>;
  setWalletAddress: Dispatch<SetStateAction<string | undefined>>;
  refreshSubject: (subject: ShopStatusType, timestamp: number) => void;
}

interface CandyProviderProps {
  children: ReactElement;
}

type Subject = { [key in ShopStatusType]?: number };

export const CandyContext = createContext<ContextData | null>(null);

export const CandyShopDataValidator: React.FC<CandyProviderProps> = ({ children }) => {
  const [candyShopAddress, setCandyShopAddress] = useState<string>();
  const [walletAddress, setWalletAddress] = useState<string>();
  /**
   * subject will be increase when some components need to check status is rendered on UI.
   * if subject value is 0: it means we don't need to check status for that subject.
   * */
  const [subjects, setSubjects] = useState<Subject>({
    [ShopStatusType.Order]: 0,
    [ShopStatusType.Trade]: 0,
    [ShopStatusType.Auction]: 0,
    [ShopStatusType.UserNft]: 0
  });

  const refreshSubject = useCallback((subject: ShopStatusType, timestamp: number) => {
    localStorage.setItem(subject, timestamp.toString());
  }, []);

  const polling = useCallback(
    (candyShopAddress: string) => {
      const targets: ShopStatusType[] = [];
      let key: keyof Subject;
      for (key in subjects) {
        if (Number(subjects[key]) > 0) targets.push(key);
      }

      if (targets.length === 0) return;
      fetchShopStatusByShopAddress(candyShopAddress, {
        targets,
        walletAddress
      })
        .then((res: SingleBase<ShopStatus[]>) => {
          if (res.result) {
            for (const shopStatus of res.result) {
              if (shopStatus.timestamp) {
                const prevTimestamp = localStorage.getItem(shopStatus.type);
                const resTimestamp = JSON.stringify(shopStatus.timestamp);
                const isShopRefreshed = prevTimestamp !== resTimestamp;
                if (isShopRefreshed) {
                  console.log(`%c${Logger}: ${shopStatus.type}`, 'color: #e9ae00', prevTimestamp, res);
                  localStorage.setItem(shopStatus.type, shopStatus.timestamp.toString());
                }
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
    [subjects, walletAddress]
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
    <CandyContext.Provider
      value={{ candyShopAddress, setCandyShopAddress, setSubjects, setWalletAddress, refreshSubject }}
    >
      {children}
    </CandyContext.Provider>
  );
};

export const useUpdateCandyShopContext: (candyShopAddress?: string) => ContextData = (candyShopAddress) => {
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

interface UpdateSubjectProps {
  subject: ShopStatusType;
  candyShopAddress?: string;
  walletAddress?: string;
}

export const useUpdateSubject = ({ subject, candyShopAddress }: UpdateSubjectProps): void => {
  const { setSubjects } = useUpdateCandyShopContext(candyShopAddress);

  useEffect(() => {
    if (!subject) return;

    setSubjects((obj: Subject) => ({ ...obj, [subject]: (obj[subject] || 0) + 1 }));
    return () => {
      setSubjects((obj: Subject) => ({ ...obj, [subject]: (obj[subject] || 0) - 1 }));
    };
  }, [setSubjects, subject]);
};

export const useUpdateWalletAddress = (walletAddress?: string): void => {
  const { setWalletAddress } = useUpdateCandyShopContext();

  useEffect(() => {
    if (!walletAddress) return;

    setWalletAddress(walletAddress);
    return () => setWalletAddress(undefined);
  }, [setWalletAddress, walletAddress]);
};
