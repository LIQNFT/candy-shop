export interface ConsumptionSignDataInterface {
  uuid: string
}

export const OrderConsumptionTypes = {
  OrderConsumption: [{ name: "uuid", type: "string" }],
}

export type SignConsumptionData = ConsumptionSignDataInterface
