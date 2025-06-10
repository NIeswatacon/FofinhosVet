// Função: Mostrar os detalhes de um item no carrinho (nome, preço, quantidade).
// Ações:
// Botões para aumentar/diminuir quantidade
// Botão para remover o item
import React, { useState } from 'react'; // Importar useState
import axios from 'axios';
import type { ItemCarrinhoDetalhado, AdicionarAoCarrinhoPayload, RemoverDoCarrinhoPayload, CarrinhoDetalhado, ApiResponse } from '../../types/index';

interface CardProdutoCarrinhoProps {
  item: ItemCarrinhoDetalhado;
  idCliente: number;
  onCarrinhoAtualizado: (carrinho: CarrinhoDetalhado | null) => void;
}

const CardProdutoCarrinho: React.FC<CardProdutoCarrinhoProps> = ({ item, idCliente, onCarrinhoAtualizado }) => {
  const [isUpdating, setIsUpdating] = useState(false); // Estado para desabilitar botões durante chamadas API

  const handleAlterarQuantidade = async (incremento: number) => {
    if (isUpdating) return;
    setIsUpdating(true);

    const novaQuantidade = item.quantidade + incremento;

    if (novaQuantidade <= 0) {
      await handleRemoverItemCompletamenteInternal();
      return;
    }

    const apiBaseUrl = 'http://localhost:8080/api/vendas';
    let payload: AdicionarAoCarrinhoPayload | RemoverDoCarrinhoPayload = {
      idCliente,
      idProduto: item.idProduto, // Corrigido para usar item.idProduto
      quantidade: Math.abs(incremento), // Usar o valor absoluto do incremento para a quantidade
    };

    let endpoint = `${apiBaseUrl}/carrinho/adicionar`;
    const requestConfig: import('axios').AxiosRequestConfig = {}; // Usar AxiosRequestConfig
    if (incremento < 0) { // Diminuindo
      endpoint = `${apiBaseUrl}/carrinho/remover`;
      // O payload para remover/diminuir quantidade espera a quantidade a ser diminuida.
      // Se for para diminuir 1, payload.quantidade = 1.
    } else { // Aumentando
            requestConfig.headers = { 'x-user-id': idCliente.toString() };

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

  // Renomeado para gerenciar o estado isUpdating internamente
  const handleRemoverItemCompletamenteInternal = async () => {
    // Verifica se já está atualizando por handleAlterarQuantidade que resultou em remoção
    // Se isUpdating já for true e a chamada veio de handleAlterarQuantidade, não precisa setar de novo.
    // Mas se for um clique direto no botão remover, precisamos setar.
    if (isUpdating && (item.quantidade + (-1) > 0)) return; // Evita setar se já está em progresso por outra ação
    setIsUpdating(true);

    const payload: RemoverDoCarrinhoPayload = { idCliente, idProduto: item.idProduto };
    console.log('[CardProdutoCarrinho] Tentando remover item completamente. Payload:', payload);
    try {
      const response = await axios.post<ApiResponse<CarrinhoDetalhado>>(`http://localhost:8080/api/vendas/carrinho/remover`, payload);
      const result = response.data;
      if (result.success) { // A API pode retornar data: null se o carrinho for removido
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