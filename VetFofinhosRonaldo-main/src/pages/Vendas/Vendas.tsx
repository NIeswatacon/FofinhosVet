import React, { useState, useEffect, useCallback } from 'react';
import GridProdutos from '../../components/GridProdutos/GridProdutos';
import IconeCarrinho from '../../components/IconeCarrinho/IconeCarrinho';
import ModalCarrinho from '../../components/ModalCarrinho/ModalCarrinho';
import type { CarrinhoDetalhado } from '../../types';
import NavBar from '../../components/NavBar/NavBar';
// import styles from './Vendas.module.css'; // Para estilos dedicados

// Removido: const ID_CLIENTE_MOCK = 101; // Defina um ID de cliente para teste

const Vendas: React.FC = () => {
  const [carrinho, setCarrinho] = useState<CarrinhoDetalhado | null>(null);
  const [modalCarrinhoVisivel, setModalCarrinhoVisivel] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Estado para o ID do usuário

  // Função auxiliar para obter o ID do usuário do localStorage
  const getUserId = (): number | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.error('Nenhum dado de usuário encontrado no localStorage.');
      return null;
    }
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        return user.id;
      } else {
        console.error('ID do usuário não encontrado no objeto do localStorage:', user);
        return null;
      }
    } catch (e) {
      console.error('Erro ao parsear dados do usuário do localStorage:', e);
      return null;
    }
  };

  const handleCarrinhoAtualizado = useCallback((carrinhoAtualizado: CarrinhoDetalhado | null) => {
    if (carrinhoAtualizado) {
      // Garante que o total e os preços dos itens sejam números
      const carrinhoProcessado = {
        ...carrinhoAtualizado,
        total: parseFloat(carrinhoAtualizado.total as any),
        itens: carrinhoAtualizado.itens.map(item => ({
          ...item,
          preco: parseFloat(item.preco as any)
        }))
      };
      setCarrinho(carrinhoProcessado);
    } else {
      setCarrinho(null);
    }
  }, []); // setCarrinho é estável, então o array de dependências pode ser vazio

  // Efeito para carregar o ID do usuário do localStorage quando o componente monta
  useEffect(() => {
    setCurrentUserId(getUserId());
  }, []);

  // Efeito para buscar o carrinho inicial quando o ID do cliente muda
  useEffect(() => {
    const fetchInitialCarrinho = async () => {
      if (!currentUserId) {
        console.log('Não há ID de usuário para buscar o carrinho inicial.');
        setCarrinho(null);
        return;
      }

      try {
        // Substitua esta chamada por uma função do vendasService quando ele for criado
        // Por enquanto, uma chamada direta ao endpoint de carrinho, se necessário.
        // const response = await axios.get(`https://microservicevendas-production.up.railway.app/carrinho/${currentUserId}`, {
        //   headers: { 'X-User-ID': currentUserId.toString() }
        // });
        // if (response.data.success && response.data.data) {
        //   handleCarrinhoAtualizado(response.data.data);
        // }
      } catch (error) {
        console.error("Erro ao buscar carrinho inicial:", error);
      }
    };
    fetchInitialCarrinho();
  }, [currentUserId, handleCarrinhoAtualizado]);

  const toggleModalCarrinho = () => {
    setModalCarrinhoVisivel(!modalCarrinhoVisivel);
  };

  const calcularTotalItensCarrinho = () => {
    if (!carrinho || !carrinho.itens) return 0;
    return carrinho.itens.reduce((total, item) => total + item.quantidade, 0);
  };

  return (
    <div>
      <NavBar />
      <IconeCarrinho
        onClick={toggleModalCarrinho}
        itemCount={calcularTotalItensCarrinho()}
        isModalVisible={modalCarrinhoVisivel} // Passa o estado de visibilidade do modal
      />

      <ModalCarrinho
        isVisible={modalCarrinhoVisivel}
        onClose={toggleModalCarrinho}
        // idCliente={ID_CLIENTE_MOCK} // Removido
        carrinhoPai={carrinho} // Passa o carrinho do estado do Vendas
        onCarrinhoChange={handleCarrinhoAtualizado} // Renomeado para onCarrinhoChange para corresponder à prop
      />

      {/* 
        A NavBar já está sendo renderizada pelo MainLayout.
        O IconeCarrinho está posicionado de forma fixa.
        O conteúdo principal da página de Vendas começa aqui.
      */}
      <div style={{ padding: '20px', marginTop: '20px' }}> {/* Adiciona um espaçamento geral */}
        <h2 style={{ 
          textAlign: 'left', 
          marginBottom: '25px', 
          fontSize: '1.8rem', 
          color: '#333',
          fontWeight: '500' 
        }}>Nossos Produtos</h2>
        <GridProdutos
          idCliente={currentUserId || 0} // Passando o ID do usuário do estado (0 se null, ajustar conforme necessidade)
          onCarrinhoAtualizado={handleCarrinhoAtualizado}
        />
      </div>
    </div>
  );
};

export default Vendas;