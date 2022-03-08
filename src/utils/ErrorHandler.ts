import { warnNotification } from './notifications';

export enum ErrorType {
  RequestExceedLimit = 'RequestExceedLimit'
}

export const ErrorMsgMap = {
  [ErrorType.RequestExceedLimit]:
    'We are having a hard time loading all your NFTs right now (are you a whale? :P). Please try again later!'
};

export const handleError = (errorType: ErrorType) => {
  if (errorType === ErrorType.RequestExceedLimit) {
    warnNotification(ErrorMsgMap[errorType]);
  }
};
