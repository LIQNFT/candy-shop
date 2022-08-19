import axios, { AxiosResponse } from 'axios';
import { RequestMethod } from '../types/api';

export class ApiCaller {
  static request = async (url: string, method: RequestMethod, data: { [key: string]: any }) => {
    let result: AxiosResponse<any>;
    try {
      result = await this.makeRequest(url, method, data);
    } catch (e: any) {
      throw Error('Can not make request - ' + e.message);
    }
    if (!result.data?.success) {
      throw Error('Request failed with status ' + result.status);
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

  private static makeRequest = async (
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
