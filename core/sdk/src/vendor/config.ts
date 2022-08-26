import axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
let interceptorEvents: number[] = [];

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
