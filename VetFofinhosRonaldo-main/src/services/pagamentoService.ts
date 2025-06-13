import axios from 'axios';
import { API_URLS } from './api';
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

export interface ReciboPayload {
  clienteId: number;
  valorTotal: number;
  agendamentoIds: number[];
  carrinhoItemIds: number[];
  dataCompra: string;
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
      // Garantir que formaPagamento seja uma string válida
      const pagamentoData = {
        ...pagamento,
        formaPagamento: pagamento.formaPagamento.toString()
      };
      
      console.log('[pagamentoService] Enviando pagamento para backend:', pagamentoData);
      const response = await axios.post(`${API_URLS.pagamento}/api/pagamentos`, pagamentoData, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('[pagamentoService] Resposta do backend:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[pagamentoService] Erro na requisição:', error.response?.data || error.message);
        if (error.response) {
          console.error('[pagamentoService] Status:', error.response.status);
          console.error('[pagamentoService] Headers:', error.response.headers);
          console.error('[pagamentoService] Data:', error.response.data);
        }
      } else {
        console.error('[pagamentoService] Erro desconhecido:', error);
      }
      throw new Error('Erro ao criar pagamento');
    }
  },

  // Listar todos os pagamentos
  listarPagamentos: async (): Promise<Pagamento[]> => {
    try {
      const response = await axios.get<Pagamento[]>(`${API_URLS.pagamento}/pagamentos`);
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
      const response = await axios.get<Pagamento>(`${API_URLS.pagamento}/pagamentos/${id}`);
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
      const response = await axios.put<Pagamento>(`${API_URLS.pagamento}/pagamentos/${id}/aprovar`);
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
      const response = await axios.put<Pagamento>(`${API_URLS.pagamento}/pagamentos/${id}/rejeitar`);
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
      const response = await axios.put<Pagamento>(`${API_URLS.pagamento}/pagamentos/${id}/cancelar`);
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
      await axios.delete(`${API_URLS.pagamento}/pagamentos/${id}`);
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
      const response = await axios.get<Pagamento[]>(`${API_URLS.pagamento}/pagamentos/cliente/${cpf}`);
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
      const response = await axios.get<Pagamento[]>(`${API_URLS.pagamento}/pagamentos/pedido/${idPedido}`);
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
      const response = await axios.get<Pagamento[]>(`${API_URLS.pagamento}/pagamentos/usuario/${idUsuario}`);
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
  },

  criarRecibo: async (recibo: ReciboPayload) => {
    try {
      const response = await axios.post(`${API_URLS.pagamento}/recibos`, recibo, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar recibo:', error);
      throw error;
    }
  }
}; 