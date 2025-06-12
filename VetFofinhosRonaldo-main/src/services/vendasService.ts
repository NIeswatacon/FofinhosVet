import api, { API_URLS } from './api';
import { AxiosError } from 'axios';
import { CarrinhoDetalhado, ApiResponse } from '../types/index'; // Ajuste o caminho conforme necessário

const vendasApi = api.create({
  baseURL: API_URLS.vendas, // Assume que você tem uma URL para o serviço de vendas em API_URLS
  headers: {
    'Content-Type': 'application/json',
  },
});

export class VendasError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'VendasError';
  }
}

const getUserId = (): number | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  try {
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch (e) {
    console.error('Erro ao obter ID do usuário:', e);
    return null;
  }
};

export const vendasService = {
  buscarCarrinhoPorUsuario: async (idUsuario: number): Promise<CarrinhoDetalhado | null> => {
    try {
      console.log('Buscando carrinho para o usuário:', idUsuario);
      const response = await vendasApi.get<ApiResponse<CarrinhoDetalhado>>('/carrinho', {
        headers: {
          'X-User-ID': idUsuario.toString(),
        },
      });
      
      if (response.data.success && response.data.data) {
        console.log('Carrinho encontrado:', response.data.data);
        return response.data.data;
      } else {
        console.log('Nenhum carrinho encontrado ou erro na resposta da API:', response.data.message);
        return null; // Retorna null se não houver carrinho ou se success for false
      }
    } catch (error) {
      console.error('Erro ao buscar carrinho do usuário:', error);
      if (error instanceof AxiosError) {
        console.error('Detalhes do erro do Axios:', {
          status: error.response?.status,
          data: error.response?.data,
        });
        if (error.response?.status === 404) {
          console.log('Carrinho não encontrado para este usuário (404), retornando null.');
          return null; // Trata 404 como carrinho não encontrado
        }
        throw new VendasError(
          (error.response?.data && (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data))) || 'Erro ao buscar carrinho',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Você pode adicionar outros métodos do serviço de vendas aqui, como adicionar/remover itens do carrinho
}; 