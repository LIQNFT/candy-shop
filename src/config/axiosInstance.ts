import axios from 'axios';


const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: `https://ckaho.liqnft.com/api`,
});

export default axiosInstance;