// Função: Mostrar os detalhes de um único produto na grade 
// (nome, preço, imagem, etc.).
// Ação: Incluirá um botão "Adicionar ao Carrinho".
import React from 'react';
import axios from 'axios';
import { BsInfoCircle } from 'react-icons/bs'; // Importar o ícone de informação
import styles from './CardProduto.module.css'; // Importar o CSS Module
import type { ProdutoBase, AdicionarAoCarrinhoPayload, CarrinhoDetalhado, ApiResponse } from '../../types/index';
import { API_URLS } from '../../services/api';

interface CardProdutoProps {
    produto: ProdutoBase;
    onProdutoAdicionado: (carrinho: CarrinhoDetalhado) => void;
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
        console.error('Erro ao obter ID do usuário no CardProduto:', e);
        return null;
    }
};

const CardProduto: React.FC<CardProdutoProps> = ({ produto, onProdutoAdicionado }) => {
    const [isAdding, setIsAdding] = React.useState(false); // Estado para rastrear se a adição está em progresso

    const getImagemGenerica = (tipo: ProdutoBase['tipo']): string => {
        const basePath = '/img/'; // Ajuste se suas imagens estiverem em outro lugar na pasta public
        if (tipo === 'REMEDIO') return `${basePath}Gemini_Generated_Image_9abs3x9abs3x9abs-removebg-preview.png`;
        if (tipo === 'RACAO') return `${basePath}Gemini_Generated_Image_r0heomr0heomr0he-removebg-preview.png`;
        if (tipo === 'BRINQUEDO') return `${basePath}61wNIf-F-8L-AC-SX425-6284fcd8f11f5_g-removebg-preview.png`;
        return `${basePath}produto_default.png`; // Uma imagem padrão caso o tipo não seja reconhecido
    };

    const handleAdicionarAoCarrinho = async () => {
        if (isAdding) return;

        setIsAdding(true);

        const idUsuario = getUserId();

        if (!idUsuario) {
            console.error("ID do usuário não encontrado no localStorage para adicionar ao carrinho.");
            setIsAdding(false);
            return;
        }

        const payload: AdicionarAoCarrinhoPayload = {
            idCliente: idUsuario,
            idProduto: produto.id,
            quantidade: 1,
        };

        console.log('[CardProduto] Iniciando adição ao carrinho...');
        console.log('[CardProduto] Payload:', payload);
        console.log('[CardProduto] Headers:', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-User-ID': idUsuario.toString()
        });

        try {
            const apiUrl = 'https://microservicevendas-production.up.railway.app/carrinho/adicionar';
            console.log('[CardProduto] Enviando requisição para:', apiUrl);

            // Adicionar timeout e validateStatus
            const response = await axios.post<ApiResponse<CarrinhoDetalhado>>(
                apiUrl,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-User-ID': idUsuario.toString()
                    },
                    timeout: 10000, // 10 segundos de timeout
                    validateStatus: (status) => status < 500 // Aceita qualquer status < 500
                }
            );

            console.log('[CardProduto] Resposta recebida:', response.data);

            const result = response.data;

            if (result.success && result.data) {
                console.log('[CardProduto] Produto adicionado com sucesso!');
                console.log('[CardProduto] Dados do carrinho atualizado:', result.data);
                onProdutoAdicionado(result.data);
            } else {
                console.error('[CardProduto] Erro na resposta da API:', result.message);
                alert('Erro ao adicionar produto ao carrinho: ' + result.message);
            }
        } catch (error) {
            console.error('[CardProduto] Erro ao adicionar produto:', error);
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    console.error('[CardProduto] Timeout na requisição');
                    alert('O servidor demorou muito para responder. Por favor, tente novamente.');
                } else if (error.code === 'ERR_NETWORK') {
                    console.error('[CardProduto] Erro de conexão:', error.message);
                    alert('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
                } else {
                    console.error('[CardProduto] Detalhes do erro:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        headers: error.response?.headers
                    });
                    alert('Erro ao adicionar produto ao carrinho: ' + (error.response?.data?.message || error.message));
                }
            } else {
                alert('Erro ao adicionar produto ao carrinho. Por favor, tente novamente.');
            }
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