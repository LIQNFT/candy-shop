import axios from 'axios';


const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: `http://ec2-52-201-255-145.compute-1.amazonaws.com/api`,
});

export default axiosInstance;