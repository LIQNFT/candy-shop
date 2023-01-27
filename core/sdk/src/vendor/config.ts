import { Blockchain } from '@liqnft/candy-shop-types';
import axios, { AxiosRequestConfig } from 'axios';

const BACKEND_STAGING_URL = 'https://ckaho.liqnft.com/api';
const BACKEND_PROD_URL = 'https://candy-shop.liqnft.com/api';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
let interceptorEvents: number[] = [];

export const getBaseUrl = (env: Blockchain): string => {
  switch (env) {
    case Blockchain.SolMainnetBeta:
    case Blockchain.Eth:
    case Blockchain.Polygon:
      return BACKEND_PROD_URL;
    default:
      return BACKEND_STAGING_URL;
  }
};

export const configBaseUrl = (baseUrl: string): void => {
  if (interceptorEvents.length) {
    interceptorEvents.forEach((id) => {
      axiosInstance.interceptors.request.eject(id);
    });
    interceptorEvents = [];
  }
  const interceptorEvent = axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig<any>) => {
      config.baseURL = baseUrl;

      return config;
    },
    (error: any) => {
      // Do something with request error
      return Promise.reject(error);
    }
  );
  interceptorEvents.push(interceptorEvent);
};

export const isCandyShopProdUrl = (baseUrl: string): boolean => {
  return baseUrl === BACKEND_PROD_URL;
};
