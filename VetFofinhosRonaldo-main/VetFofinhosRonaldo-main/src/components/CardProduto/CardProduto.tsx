// Função: Mostrar os detalhes de um único produto na grade 
// (nome, preço, imagem, etc.).
// Ação: Incluirá um botão "Adicionar ao Carrinho".
import React from 'react';
import axios from 'axios';
import { BsInfoCircle } from 'react-icons/bs'; // Importar o ícone de informação
import styles from './CardProduto.module.css'; // Importar o CSS Module
import type { ProdutoBase, AdicionarAoCarrinhoPayload, CarrinhoDetalhado, ApiResponse } from '../../types/index';

interface CardProdutoProps {
    produto: ProdutoBase;
    idCliente: number;
    onProdutoAdicionado: (carrinho: CarrinhoDetalhado) => void;
}

const CardProduto: React.FC<CardProdutoProps> = ({ produto, idCliente, onProdutoAdicionado }) => {
    const [isAdding, setIsAdding] = React.useState(false); // Estado para rastrear se a adição está em progresso

    const getImagemGenerica = (tipo: ProdutoBase['tipo']): string => {
        const basePath = '/img/'; // Ajuste se suas imagens estiverem em outro lugar na pasta public
        if (tipo === 'REMEDIO') return `${basePath}Gemini_Generated_Image_9abs3x9abs3x9abs-removebg-preview.png`;
        if (tipo === 'RACAO') return `${basePath}Gemini_Generated_Image_r0heomr0heomr0he-removebg-preview.png`;
        if (tipo === 'BRINQUEDO') return `${basePath}61wNIf-F-8L-AC-SX425-6284fcd8f11f5_g-removebg-preview.png`;
        return `${basePath}produto_default.png`; // Uma imagem padrão caso o tipo não seja reconhecido
    };



    const handleAdicionarAoCarrinho = async () => {
        if (isAdding) return; // Previne múltiplas submissões

        setIsAdding(true);
        const payload: AdicionarAoCarrinhoPayload = {
           idCliente: idCliente,
            idProduto: produto.id,
            quantidade: 1,
        };

        console.log('[CardProduto] Tentando adicionar ao carrinho, payload:', payload);

        try {
            // Corrigido o endpoint para corresponder à API de adicionar produto ao carrinho
           const response = await axios.post<ApiResponse<CarrinhoDetalhado>>(
                'https://microservicevendas-production.up.railway.app/carrinho/adicionar', 
                payload,
                { headers: { 'x-user-id': idCliente.toString() } }
            );
            const result = response.data;
            if (result.success && result.data) {
                console.log('[CardProduto] Produto adicionado com sucesso:', result.data);
                onProdutoAdicionado(result.data);
                // TODO: Adicionar feedback visual para o usuário (ex: toast)
            } else {
                console.error('[CardProduto] Erro ao adicionar produto (API success:false):', result.message);
                // TODO: Adicionar feedback de erro para o usuário
            }
        } catch (error) {
            console.error('[CardProduto] Falha ao adicionar produto ao carrinho (catch):', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('[CardProduto] Error response data:', error.response.data);
                console.error('[CardProduto] Error response status:', error.response.status);
            }
            // TODO: Adicionar feedback de erro para o usuário
        } finally {
            setIsAdding(false);
        }
    };

    const imagemExibida = produto.imagemUrl || getImagemGenerica(produto.tipo);

    return (
        <div className={styles.card}>
            <div className={styles.image_area}>
                <img src={imagemExibida} alt={produto.nome} className={styles.image} />
                {produto.descricao && (
                    <div className={styles.infoIconContainer}>
                        <BsInfoCircle size={18} />
                        <span className={styles.tooltipText}>{produto.descricao}</span>
                    </div>
                )}
            </div>
            <div className={styles.productInfo}>
                <h3>{produto.nome}</h3>
                <p>R$ {produto.preco.toFixed(2)}</p>
            </div>
            <button onClick={handleAdicionarAoCarrinho} className={styles.addToCartButton} disabled={isAdding}>
                {isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
            </button>

        </div>
    );
};

export default CardProduto;