import { BaseShop, BlockchainType } from '@liqnft/candy-shop-sdk';
import { GenericWallet, Wallet } from 'model';

export interface MainProps {
  candyShop: BaseShop;
  wallet: Wallet;
}
class Handler<T extends keyof typeof BlockchainType> {
  candyShop: BaseShop;
  private _wallet: Wallet;

  constructor(main: MainProps) {
    this.candyShop = main.candyShop;
    this._wallet = main.wallet;
  }

  protected get wallet(): GenericWallet<T> {
    return this._wallet as GenericWallet<T>;
  }
}

export default Handler;
