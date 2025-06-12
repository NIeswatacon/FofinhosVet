import React from 'react';
import CardProdutoCarrinho from '../CardProdutoCarrinho/CardProdutoCarrinho';
import type { ItemCarrinhoDetalhado, CarrinhoDetalhado } from '../../types/index';

interface GridProdutosCarrinhoProps {
  itens: ItemCarrinhoDetalhado[];
  onCarrinhoAtualizado: (carrinho: CarrinhoDetalhado | null) => void;
}


const GridProdutosCarrinho: React.FC<GridProdutosCarrinhoProps> = ({ itens, onCarrinhoAtualizado }) => {
  if (!itens || itens.length === 0) {
    return <p>Seu carrinho está vazio.</p>;
  }

  return (
    <div>
      {itens.map((item, index) => ( // Adiciona o 'index' à função de mapeamento
        <CardProdutoCarrinho
          key={item.idProduto} // idProduto deve ser único no carrinho
          item={item}
          onCarrinhoAtualizado={onCarrinhoAtualizado}
        />
      ))}
    </div>
  );
};

export default GridProdutosCarrinho;