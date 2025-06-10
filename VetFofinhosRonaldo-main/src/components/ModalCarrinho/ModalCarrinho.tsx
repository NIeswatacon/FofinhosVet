import React, { useState, useEffect, useCallback } from 'react';
import GridProdutosCarrinho from '../GridProdutoCarrinho/GridProdutoCarrinho';
import axios from 'axios';
import type { CarrinhoDetalhado, ApiResponse } from '../../types/index';
import styles from './ModalCarrinho.module.css'; // Importar o CSS Module

interface ModalCarrinhoProps {
  isVisible: boolean;
  onClose: () => void;
  idCliente: number;
  carrinhoPai: CarrinhoDetalhado | null; // Nova prop para receber o carrinho do pai
  onCarrinhoChange: (carrinho: CarrinhoDetalhado | null) => void; // Notifica o pai sobre mudanças
}

const ModalCarrinho: React.FC<ModalCarrinhoProps> = ({ isVisible, onClose, idCliente, carrinhoPai, onCarrinhoChange }) => {
  // O estado local 'carrinho' agora reflete o 'carrinhoPai' ou o resultado de uma busca inicial
  const [carrinho, setCarrinho] = useState<CarrinhoDetalhado | null>(carrinhoPai);
  const [loading, setLoading] = useState<boolean>(!carrinhoPai); // Inicia loading se não houver carrinhoPai
  const [error, setError] = useState<string | null>(null);
  
  const fetchCarrinho = useCallback(async () => {
    if (!idCliente) {
      setError("ID do cliente não fornecido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse<CarrinhoDetalhado>>(
        `http://localhost:8080/api/vendas/carrinho`,
        {
          headers: {
            'X-User-ID': idCliente.toString(),
          },
        }
      );
      const result = response.data;
      if (result.success) {
        let carrinhoData = result.data && result.data.itens ? result.data : null;
        if (carrinhoData && typeof carrinhoData.total !== 'undefined') { // Adicionada verificação para total
          // Converter total para número
          carrinhoData.total = parseFloat(String(carrinhoData.total));
          // Converter preco dos itens para número
          if (carrinhoData.itens) {
            carrinhoData.itens = carrinhoData.itens.map(item => ({
              ...item,
              preco: parseFloat(String(item.preco))
            }));
          }
        }
        console.log('[ModalCarrinho] Carrinho recebido do GET:', carrinhoData); // Log para depuração
        setCarrinho(carrinhoData);
        onCarrinhoChange(carrinhoData);
      } else {
        console.error('[ModalCarrinho] Falha ao buscar carrinho (API success:false):', result.message);
        setError(result.message || 'Falha ao buscar carrinho.');
        setCarrinho(null);
        onCarrinhoChange(null);
      }
    } catch (err) {
      console.error('[ModalCarrinho] Erro na chamada da API do carrinho:', err);
      setError('Erro ao conectar com a API do carrinho.');
      setCarrinho(null);
      onCarrinhoChange(null);
      if (axios.isAxiosError(err)) {
        console.error('Axios error:', err.message);
      } else {
        console.error('Unexpected error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [idCliente, onCarrinhoChange]);

  useEffect(() => {
    // Atualiza o estado interno do modal se a prop carrinhoPai mudar
    setCarrinho(carrinhoPai);
  }, [carrinhoPai]);

  useEffect(() => {
    if (isVisible) {
      // Se o modal se torna visível e não temos um carrinho (ou o carrinhoPai é null),
      // então fazemos a busca inicial.
     // Se o modal se torna visível:
      // 1. Se não há carrinhoPai (primeira abertura, talvez) OU
      // 2. Se o carrinhoPai existe, mas seu idUsuario não bate com o idCliente atual (mudança de usuário, improvável neste fluxo mas bom para robustez)
      // então, busca o carrinho.
      if (!carrinhoPai || (carrinhoPai && carrinhoPai.idUsuario !== idCliente)) {
        fetchCarrinho();
      }
    }
  }, [isVisible, carrinhoPai, idCliente, fetchCarrinho]);

  const handleCarrinhoAtualizadoInternamente = (carrinhoAtualizado: CarrinhoDetalhado | null) => {
    if (carrinhoAtualizado) {
      const carrinhoProcessado: CarrinhoDetalhado = {
        ...carrinhoAtualizado,
        total: parseFloat(String(carrinhoAtualizado.total)), // Garantir que total seja número
        itens: carrinhoAtualizado.itens.map(item => ({
          ...item,
          preco: parseFloat(String(item.preco)) // Garantir que preco seja número
        })),
      };
      setCarrinho(carrinhoProcessado);
      onCarrinhoChange(carrinhoProcessado); // Passa o carrinho já processado para o pai
    } else {
      setCarrinho(null);
      onCarrinhoChange(null);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <h2>Seu Carrinho</h2>
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
      </div>

      {loading && <p className={styles.loadingText}>Carregando carrinho...</p>}
      {error && <p className={styles.errorText}>Erro: {error}</p>}

      {!loading && !error && carrinho && carrinho.itens && (
        <>
          {carrinho.itens.length > 0 ? (
            <GridProdutosCarrinho
              itens={carrinho.itens}
              idCliente={idCliente} // Passa o ID do cliente real para o componente filho
              onCarrinhoAtualizado={handleCarrinhoAtualizadoInternamente}
            />
          ) : (
            <p className={styles.emptyCartText}>Seu carrinho está vazio.</p>
          )}
          {carrinho.itens.length > 0 && (
            <div className={styles.footer}>
              <h3>Total: R$ {carrinho.total.toFixed(2)}</h3>
              <button className={styles.checkoutButton}>
                Finalizar Compra
              </button>
            </div>
          )}
        </>
      )}
      {!loading && !error && !carrinho && <p className={styles.emptyCartText}>Não foi possível carregar os dados do carrinho ou ele está vazio.</p>}
    </div>
  );
};

export default ModalCarrinho;