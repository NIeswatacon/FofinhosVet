// src/services/api.ts
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuração das URLs base para cada serviço
const API_URLS = {
  servicos: 'http://localhost:8081',
  vendas: 'http://localhost:8082',
  pagamento: 'http://localhost:8085',
  conta: 'http://localhost:8084'
};

// Criando uma instância do Axios com a configuração base
const api = axios.create({
  baseURL: API_URLS.servicos, // URL padrão
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Tratar erro de autenticação
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Exportando as URLs base para uso em outros serviços
export { API_URLS };
export default api;