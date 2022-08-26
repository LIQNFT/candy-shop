import { Seaport } from '@opensea/seaport-js';
import { ethers, TypedDataDomain } from 'ethers';
import { EIP_712_ORDER_TYPE } from '@opensea/seaport-js/lib/constants';

export class SeaportHelper {
  static getSeaport(signer: ethers.providers.JsonRpcSigner) {
    return new Seaport(signer);
  }

  static async getDomainData(seaport: Seaport): Promise<TypedDataDomain> {
    return (await (seaport as any)._getDomainData()) as TypedDataDomain;
  }

  static getSignatureTypes() {
    return EIP_712_ORDER_TYPE;
  }
}
