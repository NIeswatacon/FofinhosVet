// Do backend (simplificado para o frontend entender as estruturas)

export interface ProdutoBase {
  id: number;
  nome: string;
  preco: number;
  tipo: 'REMEDIO' | 'BRINQUEDO' | 'RACAO';
  descricao?: string;
  imagemUrl?: string; // Adicionado para exibição no CardProduto
}

export interface ItemCarrinhoDetalhado {
  idProduto: number;
  quantidade: number;
  nome: string;      // Nome do produto
  preco: number;     // Preço unitário do produto
}

export interface CarrinhoDetalhado {
  idCarrinho: number | null;
  idUsuario: number;
  total: number;
  dataCriacao: string | null;        // Formato ISO Date String
  dataUltimaModificacao: string | null; // Formato ISO Date String
  itens: ItemCarrinhoDetalhado[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AdicionarAoCarrinhoPayload { idCliente: number; idProduto: number; quantidade: number; }
export interface RemoverDoCarrinhoPayload { idCliente: number; idProduto: number; quantidade?: number; }