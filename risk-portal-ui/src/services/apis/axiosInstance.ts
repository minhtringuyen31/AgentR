import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getAuth } from '@/auth';

const BASE_URL = import.meta.env.VITE_SERVER_URL;

// TODO: Implement Cognito in this entire file
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Add logic to attach token into headers
    // const token = localStorage.getItem('idToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    // return config;
    const auth = getAuth();

    if (auth?.idToken) {
      config.headers.Authorization = `Bearer ${auth.idToken}`;
    }

    return config;
  },
  async (err: any) => await Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Handle response
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const session = await fetchAuthSession({ forceRefresh: true });

        // Retrieve tokens
        const idToken = session.tokens?.idToken?.toString() ?? '';

        if (idToken) {
          localStorage.setItem('idToken', idToken);
          error.config.headers.Authorization = `Bearer ${idToken}`;
          return axiosInstance(error.config);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
