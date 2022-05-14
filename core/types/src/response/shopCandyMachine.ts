export interface CandyMachine {
  candyMachineAddress: string;
  status: ParsingStatus;
}

export interface ShopCandyMachine {
  candyShopAddress: string;
  candyMachineAddress: string;
  createdAt: Date;
}

export enum ParsingStatus {
  PENDING = 0,
  PROCESSING = 1,
  WAIT_TO_MARK_PARSED = 2,
  PARSED = 3
}
