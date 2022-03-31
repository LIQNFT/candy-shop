import axios from 'axios';
import { Cluster } from '@solana/web3.js';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: `https://ckaho.liqnft.com/api`,
});

export default axiosInstance;

export const configBaseUrl = (env: Cluster) => {
  axiosInstance.interceptors.request.use(
    function (config) {
      // Do something before request is sent
      if (env === 'devnet') {
        config.baseURL = 'https://ckaho.liqnft.com/api/';
      }
      if (env === 'mainnet-beta') {
        config.baseURL = 'https://candy-shop.liqnft.com/api/';
      }
      return config;
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error);
    }
  );
};
