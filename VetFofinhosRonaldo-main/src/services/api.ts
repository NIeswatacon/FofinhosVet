// src/services/api.ts
import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig as OriginalInternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';

// Extend InternalAxiosRequestConfig to include _retry for type safety
interface InternalAxiosRequestConfig extends OriginalInternalAxiosRequestConfig {
  _retry?: boolean;
}

// Client principal, único necessário
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/', // Gateway
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT no cabeçalho
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

// Ensure originalRequest exists before accessing its properties
    if (originalRequest && (error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {      originalRequest._retry = true;
      try {
        return await api.request(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

// Ensure originalRequest exists before accessing its properties
    if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {      // Redireciona para login ou limpa token
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
