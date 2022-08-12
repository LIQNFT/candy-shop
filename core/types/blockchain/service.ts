import { CreateShopInterface, DeleteShopInterface, UpdateShopInterface } from "../shop"
import { ethers } from "ethers"
import { ConsumptionSignDataInterface } from "../consumption"
import { BlockchainOrderInterface, BlockchainPrivateParams } from "./index"

export interface BlockchainServiceInterface {
  signOrderConsumption: (
    baseParams: BlockchainPrivateParams,
    consumption: ConsumptionSignDataInterface,
  ) => Promise<string>

  cancelOrders: (
    baseParams: BlockchainPrivateParams,
    orders: BlockchainOrderInterface[],
  ) => Promise<any>

  getSigner: (address: string) => Promise<ethers.providers.JsonRpcSigner>
  signCreateShopAction: (
    baseParams: BlockchainPrivateParams,
    shop: CreateShopInterface,
    signerAddress: string,
  ) => Promise<string>
  signUpdateShopAction: (
    baseParams: BlockchainPrivateParams,
    shop: UpdateShopInterface,
    signerAddress: string,
  ) => Promise<string>
  signDeleteShopAction: (
    baseParams: BlockchainPrivateParams,
    shop: DeleteShopInterface,
    signerAddress: string,
  ) => Promise<string>
}
