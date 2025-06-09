// Função: Exibir os produtos na PaginaListagemProdutos.
// Conteúdo: Mapeia a lista de produtos para renderizar múltiplos 
// componentes CardProduto.
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CardProduto from '../CardProduto/CardProduto';
import type { ProdutoBase, CarrinhoDetalhado, ApiResponse } from '../../types/index';

interface GridProdutosProps {
  idCliente: number;
  onCarrinhoAtualizado: (carrinho: CarrinhoDetalhado) => void;
}

const GridProdutos: React.FC<GridProdutosProps> = ({ idCliente, onCarrinhoAtualizado }) => {
  const [produtos, setProdutos] = useState<ProdutoBase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<ApiResponse<ProdutoBase[]>>('https://microservicevendas-production.up.railway.app/produtos');
        const result = response.data;
        if (result.success && result.data) {
          // Converter o preço para número
          const produtosComPrecoNumerico = result.data.map(produto => ({
            ...produto,
            preco: parseFloat(produto.preco as any) // Converte string para número
          }));
          setProdutos(produtosComPrecoNumerico);
        } else {
          setError(result.message || 'Falha ao buscar produtos.');
        }
      } catch (err) {
        setError('Erro ao conectar com a API de produtos.');
        if (axios.isAxiosError(err)) {
          console.error('Axios error:', err.message);
        } else {
          console.error('Unexpected error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  if (loading) return <p>Carregando produtos...</p>;
  if (error) return <p>Erro ao carregar produtos: {error}</p>;
  if (produtos.length === 0) return <p>Nenhum produto encontrado.</p>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', padding: '20px' }}>
      {produtos.map((produto) => (
        <CardProduto
          key={produto.id}
          produto={produto}
          idCliente={idCliente}
          onProdutoAdicionado={onCarrinhoAtualizado}
        />
      ))}
    </div>
  );
};

export default GridProdutos;