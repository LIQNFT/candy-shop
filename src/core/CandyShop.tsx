/**
 * Core Candy Shop module
 */
export class CandyShop {
  private _storeId: string;

  constructor(storeId: string) {
    this._storeId = storeId;
  }

  // TODO
  async getOrders() {
    return this._storeId;
  }

  // TODO
  async buy() {}

  // TODO
  async sell() {}

  // TODO
  async cancel() {}

  // TODO
  async getStats() {}

  // TODO
  async getTransactions() {}
}