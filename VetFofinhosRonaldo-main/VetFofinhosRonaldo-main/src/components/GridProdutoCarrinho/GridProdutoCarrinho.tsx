import React from 'react';
import CardProdutoCarrinho from '../CardProdutoCarrinho/CardProdutoCarrinho';
import type { ItemCarrinhoDetalhado, CarrinhoDetalhado } from '../../types/index';

interface GridProdutosCarrinhoProps {
  itens: ItemCarrinhoDetalhado[];
  idCliente: number;
  onCarrinhoAtualizado: (carrinho: CarrinhoDetalhado | null) => void;
}


const GridProdutosCarrinho: React.FC<GridProdutosCarrinhoProps> = ({ itens, idCliente, onCarrinhoAtualizado }) => {
  if (!itens || itens.length === 0) {
    return <p>Seu carrinho está vazio.</p>;
  }

  return (
    <div>
      {itens.map((item, index) => ( // Adiciona o 'index' à função de mapeamento
        <CardProdutoCarrinho
          // Usa uma chave composta para garantir unicidade se idProduto puder ser duplicado.
          key={`${item.idProduto}-${index}`}
          item={item}
          idCliente={idCliente} // Correção: Usar a prop idCliente recebida

          onCarrinhoAtualizado={onCarrinhoAtualizado}
        />
      ))}
    </div>
  );
};

export default GridProdutosCarrinho;