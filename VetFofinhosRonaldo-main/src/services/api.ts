// src/services/api.ts
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Criando uma instância do Axios com configurações base
const api = axios.create({
    baseURL: 'http://localhost:8083', // Porta do serviço de pagamento
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
    },
    withCredentials: true
});

// Interceptor para adicionar o token em todas as requisições
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

        // Adiciona headers de CORS para requisições OPTIONS
        if (config.method?.toUpperCase() === 'OPTIONS') {
            config.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
            config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            config.headers['Access-Control-Allow-Headers'] = '*';
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros nas respostas
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
