export interface Agendamento {
  id: number;
  data: string; // Formato YYYY-MM-DD
  servico: string; // Nome do enum, ex: "BANHO"
  nomeFuncionario?: string;
  nomePet: string;
  nomeCliente: string;
  valorServico?: number;
  statusPagamento?: 'PENDENTE' | 'PAGO' | 'CANCELADO';
}
