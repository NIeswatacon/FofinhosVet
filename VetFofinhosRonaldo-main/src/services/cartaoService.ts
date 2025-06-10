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

// Função auxiliar para obter o ID do usuário
const getUserId = (): number => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new CartaoError('Usuário não encontrado. Por favor, faça login novamente.');
  }

  try {
    const user = JSON.parse(userStr);
    if (!user.id) {
      throw new CartaoError('ID do usuário não encontrado. Por favor, faça login novamente.');
    }
    return user.id;
  } catch (e) {
    console.error('Erro ao parsear dados do usuário:', e);
    throw new CartaoError('Erro ao carregar dados do usuário. Por favor, faça login novamente.');
  }
};

// Serviço de Cartão
export const cartaoService = {
  // Criar novo cartão
  criarCartao: async (cartao: Cartao): Promise<Cartao> => {
    try {
      console.log('Criando novo cartão:', cartao);
      const response = await api.post<Cartao>('/api/cartoes', cartao);
      console.log('Cartão criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      if (error instanceof AxiosError) {
        if (error.response) {
          console.error('Detalhes do erro:', {
            status: error.response.status,
            data: error.response.data
          });
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
      console.log('Iniciando busca de cartões...');
      const userId = getUserId();
      console.log('ID do usuário:', userId);

      const response = await api.get<Cartao[]>('/api/cartoes');
      console.log('Cartões encontrados:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar cartões:', error);
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao listar cartões';
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          message: errorMessage,
          data: error.response?.data
        });
        throw new CartaoError(errorMessage, error.response?.status);
      }
      throw error;
    }
  },

  // Buscar cartão por ID
  buscarCartaoPorId: async (id: number): Promise<Cartao> => {
    try {
      console.log('Buscando cartão por ID:', id);
      const response = await api.get<Cartao>(`/api/cartoes/${id}`);
      console.log('Cartão encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cartão:', error);
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
      console.log('Buscando cartões do usuário:', idUsuario);
      const response = await api.get<Cartao[]>(`/api/cartoes/usuario/${idUsuario}`);
      console.log('Cartões encontrados:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cartões do usuário:', error);
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
      console.log('Deletando cartão:', id);
      await api.delete(`/api/cartoes/${id}`);
      console.log('Cartão deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
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