import { AssetInstanceBaseInterface } from "."
import { ERC1155Asset, ERC20Asset, ERC721Asset } from "../asset"

export interface ERC20AssetInstanceData {
  value: string
}

export type ERC20AssetInstance = AssetInstanceBaseInterface & {
  asset?: ERC20Asset
} & ERC20AssetInstanceData

export interface ERC721AssetInstanceData {
  tokenId: string
}

export type ERC721AssetInstance = AssetInstanceBaseInterface & {
  asset?: ERC721Asset
} & ERC721AssetInstanceData

export interface ERC1155AssetInstanceData {
  tokenId: string
  value: string
}

export type ERC1155AssetInstance = AssetInstanceBaseInterface & {
  asset?: ERC1155Asset
} & ERC1155AssetInstanceData
