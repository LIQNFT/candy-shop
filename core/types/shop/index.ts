export interface ShopInterface {
  uuid: string
  name: string
  logoUrl?: string
  ownerAddress: string
}

export enum SplitReceiver {
  Seller = 1,
  ShopOwner = 2,
  Platform = 3,
}

export interface PaymentSplitInterface {
  percentage: string
  receiver: SplitReceiver
}

export interface CreateShopInterface {
  name: string
  ownerAddress: string
  paymentSplit: PaymentSplitInterface[]
  logoUrl?: string
}

export interface UpdateShopInterface {
  name?: string
  logoUrl?: string
  paymentSplit?: PaymentSplitInterface[]
}

export interface DeleteShopInterface {
  uuid: string
}

export const CreateShopTypes = {
  CreateShop: [
    { name: "name", type: "string" },
    { name: "ownerAddress", type: "address" },
    { name: "logoUrl", type: "string" },
    { name: "paymentSplit", type: "PaymentSplit[]" },
  ],
  PaymentSplit: [
    { name: "percentage", type: "string" },
    { name: "receiver", type: "uint8" },
  ],
}

export const UpdateShopTypes = {
  UpdateShop: [
    { name: "name", type: "string" },
    { name: "logoUrl", type: "string" },
    { name: "paymentSplit", type: "PaymentSplit[]" },
  ],
  PaymentSplit: [
    { name: "percentage", type: "string" },
    { name: "receiver", type: "uint8" },
  ],
}

export const DeleteShopTypes = {
  DeleteShop: [{ name: "uuid", type: "string" }],
}

export type SignShopData = CreateShopInterface | UpdateShopInterface | DeleteShopInterface
