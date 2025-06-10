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
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', // Gateway
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Importante para CORS
});

// Interceptor para adicionar token JWT no cabeçalho
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('=== REQUISIÇÃO ENVIADA ===');
    console.log('URL:', config.url);
    console.log('Método:', config.method);
    console.log('Dados:', config.data);
    console.log('Headers:', config.headers);

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
    console.error('=== ERRO NA REQUISIÇÃO ===');
    console.error('Erro:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('=== RESPOSTA RECEBIDA ===');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    return response;
  },
  async (error: AxiosError) => {
    console.error('=== ERRO NA RESPOSTA ===');
    console.error('Erro completo:', error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else if (error.request) {
      console.error('Erro na requisição:', error.request);
    } else {
      console.error('Erro:', error.message);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (originalRequest && (error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {
      console.log('Tentando novamente a requisição...');
      originalRequest._retry = true;
      try {
        return await api.request(originalRequest);
      } catch (retryError) {
        console.error('Erro na nova tentativa:', retryError);
        return Promise.reject(retryError);
      }
    }

    if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
      console.log('Token inválido ou expirado');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
