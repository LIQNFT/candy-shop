import { ApiCaller } from '../api';
import { RequestMethod } from '../types/api';
import {
  BlockchainNetworkInfo,
  BlockchainNetworkInfoType,
  BlockchainNetworkInterface
} from '../types/blockchain/network';

export default class BlockchainNetworkService {
  getByUuid: (uuid: string) => Promise<BlockchainNetworkInterface> = async (uuid: string) => {
    const result = await ApiCaller.request(`/blockchain/network/${uuid}`, RequestMethod.Get, {});
    return result.result.network;
  };

  getById = async (id: number) => {
    const result = await ApiCaller.request(`/blockchain/network/id/${id}`, RequestMethod.Get, {});
    return result.result.network;
  };

  get = async (info: BlockchainNetworkInfo): Promise<BlockchainNetworkInterface> => {
    switch (info.type) {
      case BlockchainNetworkInfoType.Id:
        return await this.getById(info.networkId);
      case BlockchainNetworkInfoType.Uuid:
        return await this.getByUuid(info.networkUuid);
      default:
        throw Error('Unknown NetworkInfoType');
    }
  };
}
