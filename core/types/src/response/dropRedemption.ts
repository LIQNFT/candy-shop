export interface DropRedemption {
  vaultAddress: string;
  editionMint: string;
  walletAddress: string;
  redemptionType: number;
  userInputs: string;
  QRStatus: boolean;
  status: RedemptionStatus;
  id: string;
}

export enum RedemptionType {
  Ticket
  // other types coming
}

export interface RedemptionTypeTicketSchema {
  userName: string;
  userEmail: string;
}

export enum RedemptionStatus {
  PendingOnChainTransaction,
  PendingSendVoucher,
  SendingVoucher,
  Failed,
  RetryableSendVoucher,
  PendingRedemption,
  Redeemed
}

export interface RegisterRedemptionRequest {
  vaultAddress: string;
  editionMint: string;
  walletAddress: string;
  redemptionType: number;
  userInputs: string;
}
