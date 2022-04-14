import { notification, NotificationType } from './rc-notification';

export enum ErrorType {
  InvalidWallet = 'InvalidWallet',
  TransactionFailed = 'TransactionFailed',
}

export const ErrorMsgMap = {
  [ErrorType.InvalidWallet]: 'Invalid wallet, please connect the wallet.',
  [ErrorType.TransactionFailed]: 'Transaction failed. Please try again later.',
};

export const handleError = (errorType: ErrorType) => {
  if (errorType === ErrorType.TransactionFailed) {
    notification(
      ErrorMsgMap[ErrorType.TransactionFailed],
      NotificationType.Error
    );
  }
};
