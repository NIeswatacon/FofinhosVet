// src/types/axios.d.ts
import 'axios';

declare module 'axios' {
  // Permite adicionar a propriedade _retry à configuração da requisição
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}