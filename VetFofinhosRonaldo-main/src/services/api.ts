// src/services/api.ts
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Criando uma instância do Axios com a configuração CORRETA
const api = axios.create({
    // 1. APONTAR PARA O GATEWAY
    baseURL: 'http://localhost:8080', 
    timeout: 10000,
    // 2. REMOVER OS CABEÇALHOS DE CORS DAQUI
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Interceptor para adicionar o token e o User-ID (ESTA PARTE ESTÁ BOA)
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.id) {
                    config.headers['X-User-ID'] = user.id.toString();
                }
            } catch (e) {
                console.error('Erro ao parsear dados do usuário:', e);
            }
        }

        // 3. REMOVER ESTE BLOCO 'OPTIONS' COMPLETAMENTE
        // if (config.method?.toUpperCase() === 'OPTIONS') { ... }

        return config;
    },
    (error: AxiosError) => {
        console.error('Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de autenticação (ESTA PARTE ESTÁ BOA)
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;