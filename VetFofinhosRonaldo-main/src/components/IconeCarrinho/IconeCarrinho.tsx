// O botão que o usuário clica para "puxar"
//  (mostrar) o carrinho. Pode exibir um contador de itens.
import React from 'react';

// Ação: Ao ser clicado, alterna a visibilidade do ModalCarrinho.
interface IconeCarrinhoProps {
  onClick: () => void;
  itemCount: number;
  isModalVisible?: boolean; // Nova propriedade para controlar a visibilidade do ícone
}

const IconeCarrinho: React.FC<IconeCarrinhoProps> = ({ onClick, itemCount, isModalVisible }) => {
  if (isModalVisible) {
    return null; // Não renderiza nada se o modal estiver visível
  }

  return ( 
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '80px', // Ajustado para ficar abaixo da NavBar (considerando NavBar ~60px + margem)
        right: '20px',
        padding: '10px 15px',
        zIndex: 1001, // Mantém acima de outros conteúdos, mas abaixo de modais com z-index maior
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em' }}>
      🛒 Carrinho ({itemCount})
    </button>
  );
};

export default IconeCarrinho;