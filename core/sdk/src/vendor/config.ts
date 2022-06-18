import axios, { AxiosRequestConfig } from 'axios';
import { web3 } from '@project-serum/anchor';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
let interceptorEvents: number[] = [];

export const configBaseUrl = (env: web3.Cluster): void => {
  if (interceptorEvents.length) {
    interceptorEvents.forEach((id) => {
      axiosInstance.interceptors.request.eject(id);
    });
    interceptorEvents = [];
  }
  const interceptorEvent = axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig<any>) => {
      // Do something before request is sent
      if (env === 'devnet') {
        config.baseURL = 'https://ckaho.liqnft.com/api/';
      }
      if (env === 'mainnet-beta') {
        config.baseURL = 'https://candy-shop.liqnft.com/api/';
      }

      return config;
    },
    (error: any) => {
      // Do something with request error
      return Promise.reject(error);
    }
  );
  interceptorEvents.push(interceptorEvent);
};
