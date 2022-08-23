import {
  CreateShopInterface,
  CreateShopTypes,
  DeleteShopInterface,
  DeleteShopTypes,
  UpdateShopInterface,
  UpdateShopTypes,
} from "../../types/shop"
import { ConsumptionSignDataInterface } from "../../types/consumption"
import { BigNumber, ethers } from "ethers"
import { BlockchainServiceInterface } from "../../types/blockchain/service"
import {
  BaseTransactionResult,
  BlockchainOrderInterface,
  BlockchainPrivateParams,
  BlockchainPublicParams,
} from "../../types/blockchain"
import {
  BlockchainAccountAccessType,
  BlockchainPrivateKeyAccess,
  BlockchainProvider,
} from "../../types/blockchain/account"
import BlockchainNetworkService from "../network"
import { NFTAssetInstance, PaymentAssetInstance } from "../../types/asset-instance"
import { AssetType } from "../../types/asset"
import { ERC20ABI } from "@opensea/seaport-js/lib/abi/ERC20"
import { ERC721ABI } from "@opensea/seaport-js/lib/abi/ERC721"
import { ERC1155ABI } from "@opensea/seaport-js/lib/abi/ERC1155"
import { RequestMethod } from "../../types/api"
import {
  BlockchainCancelOrderTransactionData,
  BlockchainConsumptionAllowanceTransactionData,
  BlockchainFulfillOrderTransactionData,
  BlockchainOfferAllowanceTransactionData,
  SeaportHelperInterface,
} from "../../types/blockchain/seaport"
import { Seaport } from "@opensea/seaport-js"
import { ApiCaller } from "../api"

import { MetamaskProvider } from "../../types/sdk"
import { SeaportHelper } from "./seaport"
import { OrderInterface } from "../../types/order"

const DEFAULT_GAS_LIMIT = BigNumber.from(1000000)

export default class BlockchainService implements BlockchainServiceInterface {
  private networkService = new BlockchainNetworkService()
  private seaportHelper: SeaportHelperInterface = new SeaportHelper()

  getParamData = async (metamaskProvider: MetamaskProvider, address: string) => {
    const provider = new ethers.providers.Web3Provider(metamaskProvider, "any")
    await provider.send("eth_requestAccounts", [])
    const providerAddress = await provider._getAddress(address)
    return {
      provider,
      providerAddress,
    }
  }

  getNetworkInfo = async (networkId: number) => {
    return await this.networkService.getById(networkId)
  }

  getSigner = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
    await provider.send("eth_requestAccounts", [])
    return provider.getSigner()
  }

  private getProvider = async (
    basePublicParams: BlockchainPublicParams,
  ): Promise<{ provider: BlockchainProvider }> => {
    const fullNetworkInfo = await this.networkService.get(basePublicParams.networkInfo)
    return {
      provider: new ethers.providers.JsonRpcProvider({
        url: fullNetworkInfo.rpcUrl,
      }),
    }
  }

  private getProviderAndSigner = async (basePrivateParams: BlockchainPrivateParams) => {
    switch (basePrivateParams.access.type) {
      case BlockchainAccountAccessType.PrivateKey: {
        const provider = (await this.getProvider(basePrivateParams)).provider
        const wallet = new ethers.Wallet(basePrivateParams.access.privateKey, provider)
        const signer = wallet
        const accountAddress = await signer.getAddress()
        return {
          provider,
          signer,
          accountAddress,
        }
      }
      case BlockchainAccountAccessType.Provider: {
        const provider = basePrivateParams.access.provider
        const signer = provider.getSigner()
        const accountAddress = await signer.getAddress()
        return {
          provider,
          signer,
          accountAddress,
        }
      }
      default:
        throw Error("Unknown BlockchainAccountAccessType")
    }
  }

  private getCreateShopSignData = (shop: CreateShopInterface) => {
    return {
      domain: {},
      types: CreateShopTypes,
      value: {
        name: shop.name,
        ownerAddress: shop.ownerAddress,
        logoUrl: shop.logoUrl,
        paymentSplit: shop.paymentSplit,
      },
    }
  }

  private getUpdateShopSignData = (shop: UpdateShopInterface) => {
    return {
      domain: {},
      types: UpdateShopTypes,
      value: {
        name: shop.name || "",
        logoUrl: shop.logoUrl || "",
        paymentSplit: shop.paymentSplit || [{ percentage: "", receiver: 0 }],
      },
    }
  }

  private getDeleteShopSignData = (shop: DeleteShopInterface) => {
    return {
      domain: {},
      types: DeleteShopTypes,
      value: {
        uuid: shop.uuid,
      },
    }
  }

  signCreateShopAction = async (
    baseParams: BlockchainPrivateParams,
    shop: CreateShopInterface,
  ): Promise<string> => {
    const { domain, types, value } = this.getCreateShopSignData(shop)
    const { signer } = await this.getProviderAndSigner(baseParams)
    return await signer._signTypedData(domain, types, value)
  }

  signUpdateShopAction = async (
    baseParams: BlockchainPrivateParams,
    shop: UpdateShopInterface,
  ): Promise<string> => {
    const { domain, types, value } = this.getUpdateShopSignData(shop)
    const { signer } = await this.getProviderAndSigner(baseParams)
    return await signer._signTypedData(domain, types, value)
  }

  signDeleteShopAction = async (
    baseParams: BlockchainPrivateParams,
    shop: DeleteShopInterface,
  ): Promise<string> => {
    const { domain, types, value } = this.getDeleteShopSignData(shop)
    const { signer } = await this.getProviderAndSigner(baseParams)
    return await signer._signTypedData(domain, types, value)
  }

  signOrderConsumption = async (
    baseParams: BlockchainPrivateParams,
    consumption: ConsumptionSignDataInterface,
  ): Promise<string> => {
    const { signer } = await this.getProviderAndSigner(baseParams)
    const data = await this.getOrderConsumptionSignData(consumption.uuid)
    const signature = await signer._signTypedData(data.domain, data.types, data.value)
    return ethers.utils.splitSignature(signature).compact
  }

  getOrderConsumptionSignData = async (uuid: string) => {
    const result = await ApiCaller.request(
      `${process.env.REACT_APP_API_URL}/order/signature?consumptionUuid=` + uuid,
      RequestMethod.Get,
      {},
    )
    return result.result.data
  }

  private makeCancelOrderTransaction = async (
    seaport: Seaport,
    { params }: BlockchainCancelOrderTransactionData,
    accountAddress: string,
    signer: ethers.Wallet | ethers.providers.JsonRpcSigner,
  ): Promise<BaseTransactionResult> => {
    if (!params) throw Error("Invalid params")
    const transactionMethods = seaport.cancelOrders(params, accountAddress)
    const transaction: ethers.providers.TransactionRequest = {
      ...(await transactionMethods.buildTransaction()),
      gasLimit: DEFAULT_GAS_LIMIT,
    }
    return await (await signer.sendTransaction(transaction)).wait()
  }

  cancelOrders = async (
    baseParams: BlockchainPrivateParams,
    orders: BlockchainOrderInterface[],
  ) => {
    const { provider, accountAddress, signer } = await this.getProviderAndSigner(baseParams)
    const seaport = this.seaportHelper.getSeaport(provider)
    const transactionData = await this.getFinalCancelOrderTransactionData(orders, seaport)
    const { transactionHash } = await this.makeCancelOrderTransaction(
      seaport,
      transactionData,
      accountAddress,
      signer,
    )
    return { transactionHash }
  }

  private getFinalCancelOrderTransactionData = async (
    orders: BlockchainOrderInterface[],
    seaport: Seaport,
  ) => {
    const orderComponents = orders.map(this.seaportHelper.convertOrderToOrderComponents)
    return {
      contractAddress: seaport.contract.address,
      domain: await this.seaportHelper.getDomainData(seaport),
      functionName: "cancel",
      params: orderComponents,
    }
  }
  getBlockchainPrivateKeyAccess = (privateKey: string): BlockchainPrivateKeyAccess => {
    const wallet = new ethers.Wallet(privateKey)
    return {
      type: BlockchainAccountAccessType.PrivateKey,
      privateKey,
      address: wallet.address,
    }
  }

  private getPaymentContract = (instance: PaymentAssetInstance, provider: BlockchainProvider) => {
    if (!instance.asset) throw Error("Invalid instance")
    const contractAddress = instance.asset.address
    switch (instance?.asset?.type) {
      case AssetType.ERC20:
        return new ethers.Contract(contractAddress, ERC20ABI, provider)
      default:
        throw Error("Unknown AssetType")
    }
  }

  private getNFTContract = (instance: NFTAssetInstance, provider: BlockchainProvider) => {
    if (!instance.asset) throw Error("Invalid instance")
    const contractAddress = instance.asset.address
    switch (instance.asset.type) {
      case AssetType.ERC1155:
        return new ethers.Contract(contractAddress, ERC1155ABI, provider)
      case AssetType.ERC721:
        return new ethers.Contract(contractAddress, ERC721ABI, provider)
      default:
        throw Error("Unknown AssetType")
    }
  }

  getOrderConsumptionAllowanceTransactionData = async (
    baseParams: BlockchainPublicParams,
    order: BlockchainOrderInterface,
    convertValue = true,
  ): Promise<BlockchainConsumptionAllowanceTransactionData> => {
    const { provider } = await this.getProvider(baseParams)
    const seaport = new Seaport(provider)
    const spenderAddress = seaport.contract.address
    const assetInstance = order.selectedConsumption.assetInstance
    if (assetInstance?.asset?.type !== AssetType.ERC20) {
      throw Error("Only ERC20 assets needs consumption allowance")
    }
    const originalValue = assetInstance.value
    const value = convertValue ? ethers.utils.parseEther(originalValue) : originalValue
    return {
      contractAddress: assetInstance.asset.address,
      functionName: "approve",
      params: [spenderAddress, value],
    }
  }

  getBlockchainOrderByConsumptionUuid = async (uuid: string) => {
    const result = await ApiCaller.request(
      `${process.env.REACT_APP_API_URL}/order/consumption/${uuid}`,
      RequestMethod.Get,
      {},
    )
    return result.result.order
  }

  makeOrderConsumptionAllowance = async (
    baseParams: BlockchainPrivateParams,
    order: BlockchainOrderInterface,
    transactionData: BlockchainConsumptionAllowanceTransactionData,
  ): Promise<BaseTransactionResult> => {
    const { provider, signer } = await this.getProviderAndSigner(baseParams)
    if (!order.selectedConsumption.assetInstance) throw Error("Invalid asset instance")
    const contract = this.getPaymentContract(
      order.selectedConsumption.assetInstance,
      provider,
    ).connect(signer)
    if (!transactionData.params) throw new Error("Invalid transaction data")
    const data = await (
      await contract[transactionData.functionName](...transactionData.params, {
        gasLimit: DEFAULT_GAS_LIMIT,
      })
    ).wait()
    return { transactionHash: data.transactionHash }
  }

  getOrderOfferAllowanceTransactionData = async (
    baseParams: BlockchainPublicParams,
    order: BlockchainOrderInterface,
  ): Promise<BlockchainOfferAllowanceTransactionData> => {
    const { provider } = await this.getProvider(baseParams)
    const seaport = new Seaport(provider)
    const contract = this.getNFTContract(order.offer, provider)
    const address = seaport.contract.address
    const approved = true
    return {
      contractAddress: contract.address,
      functionName: "setApprovalForAll",
      params: [address, approved],
    }
  }

  makeOrderOfferAllowance = async (
    baseParams: BlockchainPrivateParams,
    order: BlockchainOrderInterface,
    consumptionUuid: string,
  ): Promise<BaseTransactionResult> => {
    const { provider, signer } = await this.getProviderAndSigner(baseParams)
    const contract = this.getNFTContract(order.offer, provider).connect(signer)
    const response = await ApiCaller.request(
      `${process.env.REACT_APP_API_URL}/order/consumption/${consumptionUuid}/offer/allowance`,
      RequestMethod.Get,
      {},
    )
    const transactionData = response.result.transactionData
    if (!transactionData.params) throw new Error("Invalid transaction data")
    const data = await (
      await contract[transactionData.functionName](...transactionData.params, {
        gasLimit: DEFAULT_GAS_LIMIT,
      })
    ).wait()
    return { transactionHash: data.transactionHash }
  }
  private returnTransaction = async (contract: any, transactionData: any, value?: any) => {
    return await (
      await contract[transactionData.functionName](...transactionData.params, {
        gasLimit: DEFAULT_GAS_LIMIT,
        ...(value ? { value: ethers.utils.parseEther(transactionData.value || "0") } : null),
      })
    ).wait()
  }

  private makeFulfillOrderTransaction = async (
    seaport: Seaport,
    transactionData: BlockchainFulfillOrderTransactionData,
    signer: ethers.Wallet | ethers.providers.JsonRpcSigner,
  ): Promise<BaseTransactionResult> => {
    const contract = seaport.contract.connect(signer)
    return await this.returnTransaction(contract, transactionData, transactionData.value)
  }

  fulfillOrder = async (
    baseParams: BlockchainPrivateParams,
    order: BlockchainOrderInterface,
    transactionData: BlockchainFulfillOrderTransactionData,
  ): Promise<BaseTransactionResult> => {
    const { provider, signer } = await this.getProviderAndSigner(baseParams)
    const seaport = this.seaportHelper.getSeaport(provider)
    const { transactionHash } = await this.makeFulfillOrderTransaction(
      seaport,
      transactionData,
      signer,
    )
    return { transactionHash }
  }

  private getAllBlockchainOrders = async (order: OrderInterface) => {
    if (!order.consumption) throw Error("Invalid consumption")
    return await Promise.all(
      order.consumption.map(async (one) => {
        return await this.getBlockchainOrderByConsumptionUuid(one.uuid)
      }),
    )
  }

  private getActiveBlockchainOrders = async (order: OrderInterface) => {
    const blockchainOrders = await this.getAllBlockchainOrders(order)
    const activeBlockchainOrders = []
    for (let i = 0; i < blockchainOrders.length; i++) {
      const blockchainOrder = blockchainOrders[i]
      if (order.status === 1) {
        activeBlockchainOrders.push(blockchainOrder)
      }
    }
    return activeBlockchainOrders
  }

  cancelOrder = async (
    metamaskProvider: MetamaskProvider,
    orderUuid: string,
    address: string,
  ): Promise<BaseTransactionResult> => {
    const { result } = await ApiCaller.request(
      `${process.env.REACT_APP_API_URL}/order/${orderUuid}`,
      RequestMethod.Get,
      {},
    )
    if (result.order.status !== 1) {
      throw Error("Order is not open")
    }
    const blockchainOrdersForCancel = await this.getActiveBlockchainOrders(result.order)
    const { provider, providerAddress } = await this.getParamData(metamaskProvider, address)
    const network = await provider.getNetwork()
    const baseParams: BlockchainPrivateParams = {
      networkInfo: await this.getNetworkInfo(network.chainId),
      access: {
        address: providerAddress,
        type: BlockchainAccountAccessType.Provider,
        provider,
      },
    }
    const { transactionHash } = await this.cancelOrders(baseParams, blockchainOrdersForCancel)
    if (transactionHash) {
      await ApiCaller.request(
        `${process.env.REACT_APP_API_URL}/order/${orderUuid}`,
        RequestMethod.Patch,
        {
          status: 2,
        },
      )
    }
    return { transactionHash }
  }
}
