import { ShopStatusType } from '@liqnft/candy-shop-types';
import { POLLING_INTERVAL } from 'constant';
import { useCallback, useReducer, useRef } from 'react';
import { getLocalStorage } from 'utils/getLocalStorage';
import { useInterval } from './useInterval';

export const useValidateStatus = (actions: ShopStatusType[]): number => {
  const [orderStatus, updateOrderStatus] = useReducer((s) => s + 1, 0);
  const compareRef = useRef(
    actions.reduce((acc: any, action: ShopStatusType) => {
      acc[action] = getLocalStorage(action);
      return acc;
    }, {})
  );

  const polling = useCallback(() => {
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
  }, [actions]);
  useInterval(() => {
    polling();
  }, POLLING_INTERVAL);

  return orderStatus;
};
