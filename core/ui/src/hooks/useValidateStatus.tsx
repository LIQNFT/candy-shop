import { POLLING_TIMEOUT } from 'constant';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { useEffect, useReducer, useRef } from 'react';
import { ShopStatusType } from 'solana-candy-shop-schema';
import { getLocalStorage } from 'utils/getLocalStorage';

export const useValidateStatus = (actions: ShopStatusType[]): number => {
  const [orderStatus, updateOrderStatus] = useReducer((s) => s + 1, 0);
  const compareRef = useRef(
    actions.reduce((acc: any, action: ShopStatusType) => {
      acc[action] = getLocalStorage(action);
      return acc;
    }, {})
  );

  const timeoutRef = useUnmountTimeout();

  useEffect(() => {
    const polling = () => {
      let isUpdated = false;
      actions.forEach((action) => {
        const localValue = getLocalStorage(action);
        if (compareRef.current[action] !== localValue) {
          isUpdated = true;
          compareRef.current[action] = localValue;
        }
      });

      if (isUpdated) {
        updateOrderStatus();
      }
      timeoutRef.current = setTimeout(polling, POLLING_TIMEOUT);
    };

    timeoutRef.current = setTimeout(polling, POLLING_TIMEOUT);
  }, [actions, timeoutRef]);

  return orderStatus;
};
