import React, { useState, useEffect, useCallback } from 'react';
import GridProdutos from '../../components/GridProdutos/GridProdutos';
import IconeCarrinho from '../../components/IconeCarrinho/IconeCarrinho';
import ModalCarrinho from '../../components/ModalCarrinho/ModalCarrinho';
import type { CarrinhoDetalhado } from '../../types';
import NavBar from '../../components/NavBar/NavBar';
// import styles from './Vendas.module.css'; // Para estilos dedicados

// Mock ID do cliente para desenvolvimento
const ID_CLIENTE_MOCK = 101; // Defina um ID de cliente para teste

const Vendas: React.FC = () => {
  const [carrinho, setCarrinho] = useState<CarrinhoDetalhado | null>(null);
  const [modalCarrinhoVisivel, setModalCarrinhoVisivel] = useState(false);

  // Efeito para buscar o carrinho inicial quando o componente monta ou o ID do cliente muda
  useEffect(() => {
    // Se você quiser carregar o carrinho assim que a página de vendas abrir,
    // você pode fazer uma chamada à API aqui para buscar o carrinho do ID_CLIENTE_MOCK
    // e então chamar setCarrinho com os dados retornados.
    // Exemplo:
    // const fetchInitialCarrinho = async () => {
    //   try {
    //     const response = await axios.get(`/api/carrinho/${ID_CLIENTE_MOCK}`);
    //     if (response.data.success && response.data.data) {
    //       setCarrinho(response.data.data);
    //     }
    //   } catch (error) {
    //     console.error("Erro ao buscar carrinho inicial:", error);
    //   }
    // };
    // fetchInitialCarrinho();
  }, []);

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
        idCliente={ID_CLIENTE_MOCK}
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
          idCliente={ID_CLIENTE_MOCK}
          onCarrinhoAtualizado={handleCarrinhoAtualizado}
        />
      </div>
    </div>
  );
};

export default Vendas;