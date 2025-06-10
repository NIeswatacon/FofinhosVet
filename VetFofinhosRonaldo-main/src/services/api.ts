// src/services/api.ts
import axios, { AxiosError } from 'axios';
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig as OriginalInternalAxiosRequestConfig,
} from 'axios';
import { AxiosHeaders } from 'axios';

interface InternalAxiosRequestConfig extends OriginalInternalAxiosRequestConfig {
  _retry?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', // ✅ Usa apenas o Gateway
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // ✅ Permite envio de cookies/sessão se necessário
});

// Interceptor de requisição para adicionar token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('=== REQUISIÇÃO ENVIADA ===');
    console.log('URL:', config.url);
    console.log('Método:', config.method);
    console.log('Dados:', config.data);

    const token = localStorage.getItem('token');
    if (token) {
      if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('=== ERRO NA REQUISIÇÃO ===', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('=== RESPOSTA RECEBIDA ===');
    console.log('Status:', response.status);
    return response;
  },
  async (error: AxiosError) => {
    console.error('=== ERRO NA RESPOSTA ===', error);

    const originalRequest = error.config as InternalAxiosRequestConfig;

    // Retry automático
    if (originalRequest && (error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Tentando novamente a requisição...');
      try {
        return await api.request(originalRequest);
      } catch (retryError) {
        console.error('Erro na nova tentativa:', retryError);
        return Promise.reject(retryError);
      }
    }

    // Se for 401, remove token e redireciona para login
    if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
      console.warn('Token inválido ou expirado');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
