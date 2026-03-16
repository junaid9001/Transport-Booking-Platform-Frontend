import axios from 'axios';
import { useAuthStore } from './store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // CRITICAL: This allows the browser to receive and send the HttpOnly cookie
  withCredentials: true, 
});

// Global Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the API Gateway returns 401 (Unauthorized), the cookie is expired/invalid
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);