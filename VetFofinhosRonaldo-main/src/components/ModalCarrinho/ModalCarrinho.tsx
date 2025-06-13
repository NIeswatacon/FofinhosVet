import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Função auxiliar para obter o ID do usuário do localStorage (local para este componente)
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
  const navigate = useNavigate();
  // O estado local 'carrinho' agora reflete o 'carrinhoPai' ou o resultado de uma busca inicial
  const [carrinho, setCarrinho] = useState<CarrinhoDetalhado | null>(carrinhoPai);
  const [loading, setLoading] = useState<boolean>(false);
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
        `${API_URLS.vendas}/carrinho/${idClienteFromStorage}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('[ModalCarrinho] Resposta da API:', response.data);
      const result = response.data;

      if (result.success) {
        let carrinhoData = result.data;
        if (carrinhoData) {
          carrinhoData = {
            ...carrinhoData,
            total: parseFloat(String(carrinhoData.total || 0)),
            itens: (carrinhoData.itens || []).map(item => ({
              ...item,
              preco: parseFloat(String(item.preco || 0))
            }))
          };
          console.log('[ModalCarrinho] Carrinho processado:', carrinhoData);
          setCarrinho(carrinhoData);
          onCarrinhoChange(carrinhoData);
        } else {
          console.log('[ModalCarrinho] Nenhum dado do carrinho recebido');
          setCarrinho(null);
          onCarrinhoChange(null);
        }
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
    if (isVisible) {
      fetchCarrinho();
    }
  }, [isVisible, fetchCarrinho]);

  useEffect(() => {
    if (carrinhoPai) {
      const carrinhoProcessado: CarrinhoDetalhado = {
        ...carrinhoPai,
        total: parseFloat(String(carrinhoPai.total)),
        itens: carrinhoPai.itens.map(item => ({
          ...item,
          preco: parseFloat(String(item.preco))
        })),
      };
      setCarrinho(carrinhoProcessado);
    }
  }, [carrinhoPai]);

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

  const handleFinalizarCompra = () => {
    if (carrinho && carrinho.itens.length > 0) {
      // Fecha o modal do carrinho
      onClose();
      // Navega para a página de pagamento
      navigate('/pagamento');
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
              <button 
                className={styles.checkoutButton}
                onClick={handleFinalizarCompra}
              >
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