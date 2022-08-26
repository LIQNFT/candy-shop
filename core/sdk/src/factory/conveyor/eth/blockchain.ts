import { Seaport } from '@opensea/seaport-js';
import { ERC1155ABI } from '@opensea/seaport-js/lib/abi/ERC1155';
import { ERC20ABI } from '@opensea/seaport-js/lib/abi/ERC20';
import { ERC721ABI } from '@opensea/seaport-js/lib/abi/ERC721';
import { OrderComponents, OrderParameters } from '@opensea/seaport-js/lib/types';
import { BigNumber, BigNumberish, BytesLike, ethers } from 'ethers';
import { AssetType } from './types/asset.type';
import { AssetInstanceInterface } from './types/order.type';
import { SeaportHelper } from './seaport';

const DEFAULT_GAS_LIMIT = BigNumber.from(1000000);

declare global {
  interface Window {
    ethereum: any;
  }
}

export interface TypedDataDomain {
  name?: string;
  version?: string;
  chainId?: BigNumberish;
  verifyingContract?: string;
  salt?: BytesLike;
}

export interface BlockchainTransactionData {
  domain?: TypedDataDomain;
  contractAddress: string;
  functionName: string;
  params?: any;
  value?: string;
}

export default class BlockchainService {
  static getPaymentContract(asset: AssetInstanceInterface, signer: ethers.providers.JsonRpcSigner): ethers.Contract {
    const contractAddress = asset.address;
    switch (asset.type) {
      case AssetType.ERC20:
        return new ethers.Contract(contractAddress, ERC20ABI, signer);
      default:
        throw Error('Unknown AssetType');
    }
  }

  static getNftContract(asset: AssetInstanceInterface, signer: ethers.providers.JsonRpcSigner): ethers.Contract {
    const contractAddress = asset.address;
    switch (asset.type) {
      case AssetType.ERC1155:
        return new ethers.Contract(contractAddress, ERC1155ABI, signer);
      case AssetType.ERC721:
        return new ethers.Contract(contractAddress, ERC721ABI, signer);
      default:
        throw Error('Unknown AssetType');
    }
  }

  static async getCancelOrderTxData(order: OrderComponents[], seaport: Seaport) {
    return {
      contractAddress: seaport.contract.address,
      domain: await SeaportHelper.getDomainData(seaport),
      functionName: 'cancel',
      params: [order]
    };
  }

  static getConsiderationAllowanceTxData(assetAddress: string, seaportAddress: string, paymentValue: string) {
    return {
      contractAddress: assetAddress,
      functionName: 'approve',
      params: [seaportAddress, paymentValue]
    };
  }
  static getConsiderationContractDecimal(assetAddress: string) {
    return {
      contractAddress: assetAddress,
      functionName: 'approve'
    };
  }

  static getOfferAllowanceTxData(assetAddress: string, seaportAddress: string, approved: boolean) {
    return {
      contractAddress: assetAddress,
      functionName: 'setApprovalForAll',
      params: [seaportAddress, approved]
    };
  }

  static async getFulfillOrderTxData(order: { parameters: OrderParameters; signature: string }, seaport: Seaport) {
    return {
      contractAddress: seaport.contract.address,
      domain: await SeaportHelper.getDomainData(seaport),
      functionName: 'fulfillOrder',
      params: [
        {
          parameters: order.parameters,
          signature: order.signature
        },
        order.parameters.conduitKey
      ]
    };
  }

  static async executeTransaction(
    contract: ethers.Contract,
    transactionData: BlockchainTransactionData,
    gasLimit?: BigNumber
  ) {
    const execution = await contract[transactionData.functionName](...transactionData.params, {
      gasLimit: gasLimit ?? DEFAULT_GAS_LIMIT,
      value: transactionData.value ?? null
    });
    return execution.wait();
  }
}
