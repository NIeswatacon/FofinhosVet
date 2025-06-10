import api from './api';
import { AxiosError } from 'axios';

// Tipos
export enum TipoCartao {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO'
}

export interface Cartao {
  id?: number;
  numeroCartao: string;
  nomeTitular: string;
  dataValidade: string;
  cvv: string;
  tipoCartao: TipoCartao;
  cpfTitular: string;
  idUsuario: number;
}

// Classe de erro personalizada
export class CartaoError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'CartaoError';
  }
}

// Serviço de Cartão
export const cartaoService = {
  // Criar novo cartão
  criarCartao: async (cartao: Cartao): Promise<Cartao> => {
    try {
      const response = await api.post<Cartao>('/api/cartoes', cartao);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          console.error('Erro na requisição:', error.response.data || error.response.statusText || error.message);
        } else {
          console.error('Erro na requisição:', error);
        }
        throw new CartaoError(
          (error.response?.data && (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data))) || 'Erro ao criar cartão',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Listar todos os cartões
  listarCartoes: async (): Promise<Cartao[]> => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new CartaoError('User not found in localStorage. Please login first.');
      }
      const user = JSON.parse(userStr);
      if (!user.id) {
        throw new CartaoError('User ID not found. Please login again.');
      }
      const response = await api.get<Cartao[]>('/api/cartoes', {
        headers: {
          'x-user-id': user.id
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new CartaoError(
          (error.response?.data && (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data))) || 'Erro ao listar cartões',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Buscar cartão por ID
  buscarCartaoPorId: async (id: number): Promise<Cartao> => {
    try {
      const response = await api.get<Cartao>(`/api/cartoes/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new CartaoError(
          (error.response?.data && (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data))) || 'Erro ao buscar cartão',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Buscar cartões por ID do usuário
  buscarCartoesPorUsuario: async (idUsuario: number): Promise<Cartao[]> => {
    try {
      const response = await api.get<Cartao[]>(`/api/cartoes/usuario/${idUsuario}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new CartaoError(
          (error.response?.data && (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data))) || 'Erro ao buscar cartões do usuário',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Deletar cartão
  deletarCartao: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/cartoes/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new CartaoError(
          (error.response?.data && (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data))) || 'Erro ao deletar cartão',
          error.response?.status
        );
      }
      throw error;
    }
  }
}; 