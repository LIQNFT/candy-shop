import { notification, NotificationType } from './rc-notification';
import { CandyShopError } from '@liqnft/candy-shop-sdk';

export enum ErrorType {
  InvalidWallet = 'InvalidWallet',
  GetAccountInfoFailed = 'GetAccountInfoFailed'
}

export const ErrorMsgMap = {
  [ErrorType.InvalidWallet]: 'Invalid wallet, please connect the wallet.',
  [ErrorType.GetAccountInfoFailed]: 'Get Account Information failed. Please try again later.'
};

export const handleError = (err: Error, messageUI?: string): void => {
  if (err instanceof CandyShopError) {
    console.error(`CandyShopError: type= ${err.type}`);

    notification(err.type, NotificationType.Error);

    return;
  }
  const message = messageUI || (err as any).error?.data?.message || (err as any).code || err.message || 'Unknown Error';
  notification(message, NotificationType.Error);
};
