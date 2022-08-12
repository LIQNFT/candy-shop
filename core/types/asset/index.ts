import { BlockchainNetworkInterface } from "../blockchain/network"

export enum AssetType {
  Native = 1,
  ERC20 = 2,
  ERC721 = 3,
  ERC1155 = 4,
}

export interface AssetBaseInterface {
  uuid: string
  address: string
  type: AssetType
  symbol?: string
  networkUuid: string
  network?: BlockchainNetworkInterface
}

export type NativeAsset = AssetBaseInterface & { type: AssetType.Native }
export type ERC20Asset = AssetBaseInterface & { type: AssetType.ERC20 }
export type ERC721Asset = AssetBaseInterface & { type: AssetType.ERC721 }
export type ERC1155Asset = AssetBaseInterface & { type: AssetType.ERC1155 }

export type NFTAsset = ERC721Asset | ERC1155Asset
export type TokenAsset = ERC20Asset | NFTAsset
export type PaymentAsset = NativeAsset | ERC20Asset

export type Asset = NFTAsset | PaymentAsset
