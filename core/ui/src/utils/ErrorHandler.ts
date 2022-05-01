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

export interface ErrorData {
  error?: Error;
  errorType?: ErrorType;
}

export const handleError = (errorData: ErrorData): void => {
  const errorType = errorData.errorType;
  const error = errorData.error;
  if (errorType) {
    notification(ErrorMsgMap[errorType], NotificationType.Error);
  } else if (error) {
    if (error instanceof CandyShopError) {
      console.error(`CandyShopError: type= ${error.type}`);
    }
    notification(error.message, NotificationType.Error);
  } else {
    notification('Unknown Error', NotificationType.Error);
  }
};
