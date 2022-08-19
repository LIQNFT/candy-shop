export interface SeaportOrderAdditionalInterface {
  seaportCounter: number;
  seaportZoneAddress: string;
  seaportSalt: string;
}

export interface OrderAdditionalInterface extends SeaportOrderAdditionalInterface {
  uuid: string;
}
