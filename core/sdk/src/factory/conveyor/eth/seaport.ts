import { Seaport } from '@opensea/seaport-js';
import { ethers, TypedDataDomain } from 'ethers';
import { EIP_712_ORDER_TYPE } from '@opensea/seaport-js/lib/constants';
import { randomBytes as _randomBytes } from 'crypto';
import { arrayify } from '@ethersproject/bytes';

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

  static randomBytes(length: number): Uint8Array {
    return arrayify(_randomBytes(length));
  }

  static generateRandomSalt() {
    return `0x${Buffer.from(SeaportHelper.randomBytes(8)).toString('hex').padStart(24, '0')}`;
  }
}
