export interface ListBase<T> {
  success: boolean;
  msg: undefined | string;
  result: T[];
  totalCount: number;
  count: number;
  offset: number;
}

export interface SingleBase<T> {
  success: boolean;
  msg: undefined | string;
  result: T;
}
