// Função: Mostrar os detalhes de um único produto na grade 
// (nome, preço, imagem, etc.).
// Ação: Incluirá um botão "Adicionar ao Carrinho".
import React from 'react';
import axios from 'axios';
import { BsInfoCircle } from 'react-icons/bs'; // Importar o ícone de informação
import styles from './CardProduto.module.css'; // Importar o CSS Module
import type { ProdutoBase, AdicionarAoCarrinhoPayload, CarrinhoDetalhado, ApiResponse } from '../../types/index';
import { API_URLS } from '../../services/api';

// Configuração global do Axios
const api = axios.create({
    baseURL: 'https://microservicevendas-production.up.railway.app',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para logging
api.interceptors.request.use(request => {
    console.log('[Axios] Iniciando requisição:', {
        url: request.url,
        method: request.method,
        headers: request.headers,
        data: request.data
    });
    return request;
});

api.interceptors.response.use(
    response => {
        console.log('[Axios] Resposta recebida:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        if (error.code === 'ECONNABORTED') {
            console.error('[Axios] Timeout na requisição. Verificando se o servidor está acessível...');
            // Tenta fazer uma requisição GET simples para verificar se o servidor está acessível
            fetch('https://microservicevendas-production.up.railway.app/health')
                .then(response => {
                    console.log('[Axios] Servidor está acessível:', response.status);
                })
                .catch(err => {
                    console.error('[Axios] Servidor não está acessível:', err);
                });
        }
        console.error('[Axios] Erro na requisição:', {
            message: error.message,
            code: error.code,
            config: error.config,
            response: error.response
        });
        return Promise.reject(error);
    }
);

interface CardProdutoProps {
    produto: ProdutoBase;
    onProdutoAdicionado: (carrinho: CarrinhoDetalhado) => void;
    user?: any;
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

const CardProduto: React.FC<CardProdutoProps> = ({ produto, onProdutoAdicionado, user }) => {
    const [isAdding, setIsAdding] = React.useState(false); // Estado para rastrear se a adição está em progresso
    const [editando, setEditando] = React.useState(false);
    const [novoNome, setNovoNome] = React.useState(produto.nome);
    const [novoPreco, setNovoPreco] = React.useState(produto.preco);

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

        // Garantir que idUsuario seja um número
        const idCliente = Number(idUsuario);
        if (isNaN(idCliente)) {
            console.error("ID do usuário inválido:", idUsuario);
            setIsAdding(false);
            return;
        }

        // Validar o produto
        if (!produto || !produto.id) {
            console.error("Produto inválido:", produto);
            setIsAdding(false);
            return;
        }

        // Criar payload exatamente como no Postman
        const payload = {
            idCliente: idCliente,
            idProduto: Number(produto.id),
            quantidade: 1
        };

        console.log('[CardProduto] Iniciando adição ao carrinho...');
        console.log('[CardProduto] Payload:', JSON.stringify(payload, null, 2));

        try {
            // Fazer a requisição exatamente como no Postman
            const response = await axios.post(
                'https://microservicevendas-production.up.railway.app/carrinho/adicionar',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('[CardProduto] Resposta recebida:', response.data);

            if (response.data.success && response.data.data) {
                console.log('[CardProduto] Produto adicionado com sucesso!');
                onProdutoAdicionado(response.data.data);
            } else {
                console.error('[CardProduto] Erro na resposta da API:', response.data.message);
                alert('Erro ao adicionar produto ao carrinho: ' + response.data.message);
            }
        } catch (error) {
            console.error('[CardProduto] Erro ao adicionar produto:', error);
            if (axios.isAxiosError(error)) {
                console.error('[CardProduto] Detalhes do erro:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers,
                        data: error.config?.data
                    }
                });
                alert('Erro ao adicionar produto ao carrinho: ' + (error.response?.data?.message || error.message));
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
                {editando ? (
                    <>
                        <input value={novoNome} onChange={e => setNovoNome(e.target.value)} style={{ marginBottom: 4, width: '90%' }} />
                        <input type="number" value={novoPreco} onChange={e => setNovoPreco(Number(e.target.value))} style={{ marginBottom: 4, width: '90%' }} />
                    </>
                ) : (
                    <>
                        <h3>{produto.nome}</h3>
                        <p>R$ {produto.preco.toFixed(2)}</p>
                    </>
                )}
            </div>
            {user?.tipo === 'ADMIN' ? (
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column', marginTop: 8 }}>
                    {editando ? (
                        <>
                            <button className={styles.addToCartButton} style={{ background: '#007bff' }} onClick={async () => {
                                // Chamar endpoint de edição de produto (ajuste a URL conforme seu backend)
                                try {
                                    await axios.put(`https://microservicevendas-production.up.railway.app/produtos/${produto.id}`, {
                                        nome: novoNome,
                                        preco: novoPreco
                                    });
                                    setEditando(false);
                                    window.location.reload();
                                } catch {
                                    alert('Erro ao editar produto.');
                                }
                            }}>Salvar</button>
                            <button className={styles.addToCartButton} style={{ background: '#888' }} onClick={() => setEditando(false)}>Cancelar</button>
                        </>
                    ) : (
                        <>
                            <button className={styles.addToCartButton} style={{ background: '#007bff' }} onClick={() => setEditando(true)}>Editar</button>
                            <button className={styles.addToCartButton} style={{ background: '#dc3545' }} onClick={async () => {
                                if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
                                try {
                                    await axios.delete(`https://microservicevendas-production.up.railway.app/produtos/${produto.id}`);
                                    window.location.reload();
                                } catch {
                                    alert('Erro ao excluir produto.');
                                }
                            }}>Excluir</button>
                        </>
                    )}
                </div>
            ) : (
                <button onClick={handleAdicionarAoCarrinho} className={styles.addToCartButton} disabled={isAdding}>
                    {isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                </button>
            )}
        </div>
    );
};

export default CardProduto;