import React from 'react';
import CardProdutoCarrinho from '../CardProdutoCarrinho/CardProdutoCarrinho';
import type { ItemCarrinhoDetalhado, CarrinhoDetalhado } from '../../types/index';

interface GridProdutosCarrinhoProps {
  itens: ItemCarrinhoDetalhado[];
  onCarrinhoAtualizado: (carrinho: CarrinhoDetalhado | null) => void;
  idCarrinho: number;
}

const GridProdutosCarrinho: React.FC<GridProdutosCarrinhoProps> = ({ itens, onCarrinhoAtualizado, idCarrinho }) => {
  if (!itens || itens.length === 0) {
    return <p>Seu carrinho está vazio.</p>;
  }

  return (
    <div>
      {itens.map((item, index) => (
        <CardProdutoCarrinho
          key={item.idProduto}
          item={item}
          onCarrinhoAtualizado={onCarrinhoAtualizado}
          idCarrinho={idCarrinho}
        />
      ))}
    </div>
  );
};

export default GridProdutosCarrinho;