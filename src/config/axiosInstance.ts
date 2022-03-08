import axios from 'axios';


const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: `${process.env.URL || 'http://localhost'}/api`,
});

export default axiosInstance;