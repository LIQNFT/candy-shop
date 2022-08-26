import axios, { AxiosResponse } from 'axios';
import { SplitReceiver } from './types/shop.type';

export enum RequestMethod {
  Post,
  Get,
  Put,
  Patch,
  Delete
}

export class ApiCaller {
  constructor(private ethBackendUrl: string) {}

  request = async (url: string, method: RequestMethod, data: { [key: string]: any }, network?: string) => {
    let result: AxiosResponse<any>;
    try {
      url = `${this.ethBackendUrl}${url}`;
      result = await this.makeRequest(url, method, data);
    } catch (e: any) {
      throw Error('Can not make request - ' + e.message);
    }

    if (!result.data?.success) {
      if (result.data?.msg && result.data?.msg) {
        throw Error(result.data?.msg);
      } else {
        console.error(result.data);
        throw Error('Status error, no details');
      }
    }
    return result.data;
  };

  private makeRequest = async (
    url: string,
    method: RequestMethod,
    data: { [key: string]: any }
  ): Promise<AxiosResponse<any>> => {
    switch (method) {
      case RequestMethod.Post: {
        return await axios.post(url, data);
      }
      case RequestMethod.Put: {
        return await axios.put(url, data);
      }
      case RequestMethod.Patch: {
        return await axios.patch(url, data);
      }
      case RequestMethod.Delete: {
        return await axios.delete(url, data);
      }
      case RequestMethod.Get: {
        return await axios.get(url, { params: data });
      }
      default:
        throw Error('Such method is not defined');
    }
  };
}

export interface paymentAsset {
  address: string;
  symbol: string;
}

export interface PaymentSplit {
  percentage: string;
  receiver: SplitReceiver;
}

export interface Shop {
  name: string;
  ownerAddress: string;
  logoUrl: string;
  websiteUrl: string;
  discordUrl: string;
  twitterUrl: string;
  paymentSplit: PaymentSplit[];
  paymentAssets: paymentAsset[];
  createdAt: Date;
}
