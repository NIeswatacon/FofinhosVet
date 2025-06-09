// c:/Users/RDGE/OneDrive/Área de Trabalho/lopes/VetFofinhosRonaldo/src/services/api.ts
import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios'; // Importar AxiosHeaders como valor

// Configuração base do axios
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', // Use variável de ambiente
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configuração do axios para o serviço de vendas
export const apiVendas: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_VENDAS_URL || 'http://localhost:8081', // Ajuste a porta conforme necessário
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token'); // Ou sua forma de obter o token
    if (token) {
      if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para requisições do serviço de vendas
apiVendas.interceptors.request.use(
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
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig; // Cast para incluir _retry

    // Lógica de retry para erros de rede ou timeout, se ainda não foi tentado
    if (originalRequest && (error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Retrying request due to network error/timeout:', originalRequest);
      try {
        return await api.request(originalRequest);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        return Promise.reject(retryError);
      }
    }

    // Tratamento de erros específicos de status HTTP
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Lógica de refresh token ou redirecionamento para login
          if (originalRequest && !originalRequest._retry) { // Evita loop se o retry também der 401
            console.error('Erro 401: Não autorizado.');
            // Ex: localStorage.removeItem('token'); window.location.href = '/login';
          }
          break;
        // Outros casos de erro...
      }
    }
    return Promise.reject(error);
  }
);

// Interceptor para respostas do serviço de vendas
apiVendas.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (originalRequest && (error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Retrying request due to network error/timeout:', originalRequest);
      try {
        return await apiVendas.request(originalRequest);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        return Promise.reject(retryError);
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 401:
          if (originalRequest && !originalRequest._retry) {
            console.error('Erro 401: Não autorizado.');
          }
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

