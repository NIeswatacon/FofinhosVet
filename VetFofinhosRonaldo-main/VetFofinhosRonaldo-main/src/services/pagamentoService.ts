import { apiVendas } from './api';
import { AxiosError } from 'axios';

// Tipos
export enum FormaPagamento {
  CARTAO = 'CARTAO',
  PIX = 'PIX'
}

export enum StatusPagamento {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  CANCELADO = 'CANCELADO'
}

export interface Pagamento {
  id?: number;
  valor: number;
  formaPagamento: FormaPagamento;
  idPedido: number;
  nomeCliente: string;
  cpfCliente: string;
  idUsuario: number;
  status?: StatusPagamento;
  dataPagamento?: string;
  chavePix?: string;
}

// Classe de erro personalizada
export class PagamentoError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'PagamentoError';
  }
}

// Serviço de Pagamento
export const pagamentoService = {
  // Criar novo pagamento
  criarPagamento: async (pagamento: Pagamento): Promise<Pagamento> => {
    try {
      const response = await apiVendas.post<Pagamento>('/api/pagamentos', pagamento);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          console.error('Erro na requisição:', error.response.data);
        } else {
          console.error('Erro na requisição:', error);
        }
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao criar pagamento',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Listar todos os pagamentos
  listarPagamentos: async (): Promise<Pagamento[]> => {
    try {
      const response = await apiVendas.get<Pagamento[]>('/api/pagamentos');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao listar pagamentos',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Buscar pagamento por ID
  buscarPagamentoPorId: async (id: number): Promise<Pagamento> => {
    try {
      const response = await apiVendas.get<Pagamento>(`/api/pagamentos/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao buscar pagamento',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Aprovar pagamento
  aprovarPagamento: async (id: number): Promise<Pagamento> => {
    try {
      const response = await apiVendas.put<Pagamento>(`/api/pagamentos/${id}/aprovar`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao aprovar pagamento',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Rejeitar pagamento
  rejeitarPagamento: async (id: number): Promise<Pagamento> => {
    try {
      const response = await apiVendas.put<Pagamento>(`/api/pagamentos/${id}/rejeitar`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao rejeitar pagamento',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Cancelar pagamento
  cancelarPagamento: async (id: number): Promise<Pagamento> => {
    try {
      const response = await apiVendas.put<Pagamento>(`/api/pagamentos/${id}/cancelar`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao cancelar pagamento',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Deletar pagamento
  deletarPagamento: async (id: number): Promise<void> => {
    try {
      await apiVendas.delete(`/api/pagamentos/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao deletar pagamento',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Buscar pagamentos por CPF do cliente
  buscarPagamentosPorCpf: async (cpf: string): Promise<Pagamento[]> => {
    try {
      const response = await apiVendas.get<Pagamento[]>(`/api/pagamentos/cliente/${cpf}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao buscar pagamentos do cliente',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Buscar pagamentos por ID do pedido
  buscarPagamentosPorPedido: async (idPedido: number): Promise<Pagamento[]> => {
    try {
      const response = await apiVendas.get<Pagamento[]>(`/api/pagamentos/pedido/${idPedido}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao buscar pagamentos do pedido',
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Buscar pagamentos por ID do usuário
  buscarPagamentosPorUsuario: async (idUsuario: number): Promise<Pagamento[]> => {
    try {
      const response = await apiVendas.get<Pagamento[]>(`/api/pagamentos/usuario/${idUsuario}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PagamentoError(
          error.response?.data?.message || 'Erro ao buscar pagamentos do usuário',
          error.response?.status
        );
      }
      throw error;
    }
  }
}; 