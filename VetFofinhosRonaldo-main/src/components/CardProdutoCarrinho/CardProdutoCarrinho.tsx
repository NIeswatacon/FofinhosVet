// Função: Mostrar os detalhes de um item no carrinho (nome, preço, quantidade).
// Ações:
// Botões para aumentar/diminuir quantidade
// Botão para remover o item
import React, { useState } from 'react'; // Importar useState
import axios from 'axios';
import type { ItemCarrinhoDetalhado, AdicionarAoCarrinhoPayload, RemoverDoCarrinhoPayload, CarrinhoDetalhado, ApiResponse } from '../../types/index';

interface CardProdutoCarrinhoProps {
  item: ItemCarrinhoDetalhado;
  onCarrinhoAtualizado: (carrinho: CarrinhoDetalhado | null) => void;
  idCarrinho: number; // Adicionando o ID do carrinho como prop
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
    console.error('Erro ao obter ID do usuário:', e);
    return null;
  }
};

const CardProdutoCarrinho: React.FC<CardProdutoCarrinhoProps> = ({ item, onCarrinhoAtualizado, idCarrinho }) => {
  const [isUpdating, setIsUpdating] = useState(false); // Estado para desabilitar botões durante chamadas API

  const handleAlterarQuantidade = async (incremento: number) => {
    if (isUpdating) return;
    setIsUpdating(true);

    const novaQuantidade = item.quantidade + incremento;

    // Se a quantidade atual for 1 e o usuário clicar em -, remove o item
    if (item.quantidade === 1 && incremento < 0) {
      await handleRemoverItemCompletamenteInternal();
      return;
    }

    if (novaQuantidade <= 0) {
      await handleRemoverItemCompletamenteInternal();
      return;
    }

    const idCliente = getUserId(); // Obtendo o ID do localStorage

    if (!idCliente) {
      console.error("ID do cliente não fornecido no localStorage.");
      setIsUpdating(false);
      return; // Retorna sem fazer a chamada se o ID não for encontrado
    }

    const apiBaseUrl = 'https://microservicevendas-production.up.railway.app/';
    let endpoint = '';
    let payload: any = {}; // Usar 'any' temporariamente ou definir tipos mais flexíveis
    const requestConfig: import('axios').AxiosRequestConfig = {
      headers: { 'X-User-ID': idCliente.toString() }
    };

    if (incremento < 0) { // Diminuindo
      endpoint = `${apiBaseUrl}/carrinho/remover`;
      payload = {
        idProduto: item.idProduto,
        quantidade: Math.abs(incremento), // Quantidade a ser diminuída
      };
    } else { // Aumentando
      endpoint = `${apiBaseUrl}/carrinho/adicionar`;
      payload = {
        idProduto: item.idProduto,
        quantidade: incremento,
      };
    }

    console.log('[CardProdutoCarrinho] Tentando alterar quantidade. Endpoint:', endpoint, 'Payload:', payload);

    try {
      const response = await axios.post<ApiResponse<CarrinhoDetalhado>>(endpoint, payload, requestConfig);
      const result = response.data;

      if (result.success && result.data) {
        console.log('[CardProdutoCarrinho] Quantidade alterada com sucesso:', result.data);
        onCarrinhoAtualizado(result.data);
      } else {
        console.error('[CardProdutoCarrinho] Erro ao atualizar quantidade (API success:false):', result.message);
        // TODO: Adicionar feedback de erro para o usuário
      }
    } catch (error) {
      console.error('[CardProdutoCarrinho] Falha ao atualizar quantidade (catch):', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('[CardProdutoCarrinho] Error response data (update quantity):', error.response.data);
        console.error('[CardProdutoCarrinho] Error response status (update quantity):', error.response.status);
      }
      // TODO: Adicionar feedback de erro
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoverItemCompletamenteInternal = async () => {
    if (isUpdating && (item.quantidade + (-1) > 0)) return;
    setIsUpdating(true);

    const idCliente = getUserId();

    if (!idCliente) {
      console.error("ID do cliente não fornecido no localStorage para remover item.");
      setIsUpdating(false);
      return;
    }

    try {
      const response = await axios.delete<ApiResponse<CarrinhoDetalhado>>(
        `https://microservicevendas-production.up.railway.app/carrinho/${idCarrinho}/remover/${item.idProduto}`,
        {
          data: { idCliente },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;
      if (result.success) {
        console.log('[CardProdutoCarrinho] Item removido com sucesso:', result.data);
        onCarrinhoAtualizado(result.data || null);
      } else {
        console.error('[CardProdutoCarrinho] Erro ao remover item (API success:false):', result.message);
      }
    } catch (error) {
      console.error('[CardProdutoCarrinho] Falha ao remover item (catch):', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('[CardProdutoCarrinho] Error response data (remove item):', error.response.data);
        console.error('[CardProdutoCarrinho] Error response status (remove item):', error.response.status);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ borderBottom: '1px solid #eee', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h4>{item.nome} (R$ {item.preco.toFixed(2)})</h4>
        <p>Subtotal: R$ {(item.preco * item.quantidade).toFixed(2)}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <button onClick={() => handleAlterarQuantidade(-1)} disabled={isUpdating || item.quantidade <= 0}>-</button>
        <span>{item.quantidade}</span>
        <button onClick={() => handleAlterarQuantidade(1)} disabled={isUpdating}>+</button>
        <button
          onClick={handleRemoverItemCompletamenteInternal}
          style={{ marginLeft: '10px', color: 'red', border: '1px solid red', background: 'transparent' }}
          disabled={isUpdating}
        >Remover</button>
      </div>
    </div>
  );
};

export default CardProdutoCarrinho;




