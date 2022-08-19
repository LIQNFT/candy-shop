export interface BlockchainNetworkInterface {
  uuid: string;
  id: number;
  explorerUrl: string;
  rpcUrl: string;
}

export enum BlockchainNetworkInfoType {
  Uuid = 1,
  Id = 2
}

export type BlockchainNetworkInfo =
  | {
      type: BlockchainNetworkInfoType.Uuid;
      networkUuid: string;
    }
  | { type: BlockchainNetworkInfoType.Id; networkId: number };
