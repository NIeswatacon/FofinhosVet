import React, { useState, useEffect, useCallback } from 'react';
import GridProdutosCarrinho from '../GridProdutoCarrinho/GridProdutoCarrinho';
import axios from 'axios';
import type { CarrinhoDetalhado, ApiResponse } from '../../types/index';
import styles from './ModalCarrinho.module.css'; // Importar o CSS Module
import { API_URLS } from '../../services/api'; // Importar API_URLS do api.ts (caminho corrigido)

interface ModalCarrinhoProps {
  isVisible: boolean;
  onClose: () => void;
  carrinhoPai: CarrinhoDetalhado | null; // Nova prop para receber o carrinho do pai
  onCarrinhoChange: (carrinho: CarrinhoDetalhado | null) => void; // Notifica o pai sobre mudanças
}

// Função auxiliar para obter o ID do usuário do localStorage
const getUserId = (): number | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  try {
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch (e) {
    console.error('Erro ao obter ID do usuário no ModalCarrinho:', e);
    return null;
  }
};

const ModalCarrinho: React.FC<ModalCarrinhoProps> = ({ isVisible, onClose, carrinhoPai, onCarrinhoChange }) => {
  // O estado local 'carrinho' agora reflete o 'carrinhoPai' ou o resultado de uma busca inicial
  const [carrinho, setCarrinho] = useState<CarrinhoDetalhado | null>(carrinhoPai);
  const [loading, setLoading] = useState<boolean>(!carrinhoPai); // Inicia loading se não houver carrinhoPai
  const [error, setError] = useState<string | null>(null);

  const fetchCarrinho = useCallback(async () => {
    const idClienteFromStorage = getUserId();

    if (!idClienteFromStorage) {
      setError("ID do cliente não fornecido no localStorage.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('[ModalCarrinho] Buscando carrinho para o usuário:', idClienteFromStorage);
      const response = await axios.get<ApiResponse<CarrinhoDetalhado>>(
        `https://microservicevendas-production.up.railway.app/carrinho/${idClienteFromStorage}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-User-ID': idClienteFromStorage.toString()
          }
        }
      );

      console.log('[ModalCarrinho] Resposta da API:', response.data);
      const result = response.data;

      if (result.success) {
        let carrinhoData = result.data;
        if (carrinhoData) {
          // Garantir que os valores numéricos sejam tratados corretamente
          carrinhoData = {
            ...carrinhoData,
            total: parseFloat(String(carrinhoData.total || 0)),
            itens: (carrinhoData.itens || []).map(item => ({
              ...item,
              preco: parseFloat(String(item.preco))
            }));
          }
        }
        console.log('[ModalCarrinho] Carrinho recebido do GET:', carrinhoData); // Log para depuração
        setCarrinho(carrinhoData);
        onCarrinhoChange(carrinhoData);
      } else {
        console.error('[ModalCarrinho] Falha ao buscar carrinho:', result.message);
        setError(result.message || 'Falha ao buscar carrinho.');
        setCarrinho(null);
        onCarrinhoChange(null);
      }
    } catch (err) {
      console.error('[ModalCarrinho] Erro na chamada da API:', err);
      setError('Erro ao conectar com a API do carrinho.');
      setCarrinho(null);
      onCarrinhoChange(null);
      if (axios.isAxiosError(err)) {
        console.error('Detalhes do erro Axios:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
      }
    } finally {
      setLoading(false);
    }
  }, [onCarrinhoChange]);

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
      const currentUserId = getUserId();
      if (!carrinhoPai || (carrinhoPai && carrinhoPai.idUsuario !== currentUserId)) {
        fetchCarrinho();
      }
    }
  }, [isVisible, carrinhoPai, fetchCarrinho]);

  const handleCarrinhoAtualizadoInternamente = (carrinhoAtualizado: CarrinhoDetalhado | null) => {
    if (carrinhoAtualizado) {
      const carrinhoProcessado: CarrinhoDetalhado = {
        ...carrinhoAtualizado,
        total: parseFloat(String(carrinhoAtualizado.total || 0)),
        itens: carrinhoAtualizado.itens.map(item => ({
          ...item,
          preco: parseFloat(String(item.preco || 0)),
          quantidade: parseInt(String(item.quantidade || 0))
        }))
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