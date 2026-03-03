import axios from 'axios';
import { getToken } from '../utils/storage';

const axiosClient = axios.create({
  // baseURL: 'https://doctor-appointment-5j6e.onrender.com',
  baseURL: 'https://mydent-api.onrender.com',
  timeout: 15000,
});

// Attach token from storage to each request
axiosClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  // console.log('1. Innrerceptor running for url:', config.url);
  // console.log('2. Token found in storage:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('No token found in storage.');
  }
  return config;
});

// Log detailed error info for failed requests to help debugging network issues
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const cfg = error?.config || {};
      const status = error?.response?.status;
      const url = cfg.baseURL ? cfg.baseURL + (cfg.url || '') : cfg.url;
      // Concise log — full details available in error object at call-site
      console.warn(
        `API ${cfg.method?.toUpperCase()} ${cfg.url} → ${status ?? 'NO_RESPONSE'}: ${error?.response?.data?.message ?? error?.message}`,
      );

      // Graceful message: replace raw network errors with user-friendly text
      if (!error.response) {
        // No response at all — network issue
        error._friendlyMessage =
          'Unable to connect. Please check your internet connection and try again.';
      } else if (status === 401) {
        error._friendlyMessage = 'Session expired. Please log in again.';
      } else if (status === 403) {
        error._friendlyMessage = 'You don\'t have permission to do that.';
      } else if (status >= 500) {
        error._friendlyMessage =
          'Something went wrong on our end. Please try again later.';
      }
    } catch (e) {
      console.error('Failed to log axios error details', e);
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
