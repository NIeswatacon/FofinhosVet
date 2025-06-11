"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removerProdutoDoCarrinho = exports.adicionarProdutoAoCarrinho = exports.listarProdutosDoCarrinho = void 0;
const database_1 = require("../database"); // Importar o pool de conexões
// Função auxiliar para calcular e atualizar o total do carrinho
async function atualizarTotalCarrinho(connection, idCarrinho) {
    const [itensResult] = await connection.execute(`SELECT ic.quantidade, pb.preco 
     FROM ItemCarrinho ic
     JOIN ProdutoBase pb ON ic.idProduto = pb.id
     WHERE ic.idCarrinho = ?`, [idCarrinho]);
    const novoTotal = itensResult.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
    await connection.execute(`UPDATE Carrinho SET total = ?, dataUltimaModificacao = NOW() WHERE idCarrinho = ?`, [novoTotal, idCarrinho]);
    return novoTotal;
}
// Função auxiliar para buscar e formatar os detalhes completos do carrinho
async function obterDetalhesCarrinhoFormatado(connection, idCarrinho) {
    const [carrinhoRows] = await connection.execute(`SELECT idCarrinho, idUsuario, total, dataCriacao, dataUltimaModificacao 
     FROM Carrinho WHERE idCarrinho = ?`, [idCarrinho]);
    if (carrinhoRows.length === 0) {
        return { carrinho: null, itens: [] };
    }
    const carrinho = carrinhoRows[0];
    const [itensDB] = await connection.execute(`SELECT
        ic.idProduto as idProduto,

       ic.quantidade, 
       pb.preco as preco,
       pb.nome as nome_produto
     FROM ItemCarrinho ic -- ic.idProduto está correto conforme sua DDL de ItemCarrinho
     JOIN ProdutoBase pb ON ic.idProduto = pb.id 
     WHERE ic.idCarrinho = ?`, [idCarrinho]);
    const itensFormatados = itensDB.map(item => ({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        nome: item.nome_produto,
        preco: item.preco, // Este é o pb.preco
    }));
    return { carrinho, itens: itensFormatados };
}
// @route   GET /carrinho
// @desc    Lista todos os produtos no carrinho do usuário (mockado)
// @access  Private (geralmente requer autenticação para saber qual carrinho buscar)
const listarProdutosDoCarrinho = async (req, res, next) => {
    // Log para verificar todos os cabeçalhos recebidos
    console.log('[listarProdutosDoCarrinho] Headers recebidos:', JSON.stringify(req.headers, null, 2));
    const idUsuarioLogado = req.headers['x-user-id'];
    console.log('[listarProdutosDoCarrinho] Valor de X-User-ID lido:', idUsuarioLogado);
    if (!idUsuarioLogado) {
        res.status(403).json({ success: false, message: 'ID do usuário não fornecido no cabeçalho X-User-ID.' });
        return;
    }
    const idCliente = parseInt(idUsuarioLogado);
    try {
        const [carrinhosResult] = await database_1.pool.execute(`SELECT idCarrinho FROM Carrinho WHERE idUsuario = ?`, [idCliente]);
        if (carrinhosResult.length === 0) {
            res.status(200).json({
                success: true,
                message: 'Carrinho vazio ou não encontrado para este cliente.',
                data: { idUsuario: idCliente, itens: [], total: 0, idCarrinho: null, dataCriacao: null, dataUltimaModificacao: null }
            });
            return;
        }
        const idCarrinho = carrinhosResult[0].idCarrinho;
        const { carrinho, itens } = await obterDetalhesCarrinhoFormatado(database_1.pool, idCarrinho);
        if (!carrinho) {
            res.status(404).json({ success: false, message: 'Carrinho não encontrado após verificação inicial.' });
            return;
        }
        res.status(200).json({ success: true, data: Object.assign(Object.assign({}, carrinho), { itens }) });
    }
    catch (err) {
        console.error("Erro ao buscar produtos do carrinho:", err);
        next(err);
    }
};
exports.listarProdutosDoCarrinho = listarProdutosDoCarrinho;
// @route   POST /carrinho/adicionar
// @desc    Adiciona um produto ao carrinho ou atualiza sua quantidade
// @access  Private
const adicionarProdutoAoCarrinho = async (req, res, next) => {
    let connection = null;
    try {
        const idUsuarioLogado = req.headers['x-user-id'];
        const { idProduto, quantidade } = req.body;
        if (!idUsuarioLogado) {
            res.status(403).json({ success: false, message: 'ID do usuário não fornecido no cabeçalho X-User-ID.' });
            return;
        }
        if (idProduto === undefined || quantidade === undefined) {
            res.status(400).json({ success: false, message: 'idProduto e quantidade são obrigatórios.' });
            return;
        }
        const idCliente = parseInt(idUsuarioLogado);
        if (typeof quantidade !== 'number' || quantidade <= 0) {
            res.status(400).json({ success: false, message: 'Quantidade deve ser um número positivo.' });
            return;
        }
        connection = await database_1.pool.getConnection();
        await connection.beginTransaction();
        // 1. Buscar informações do produto no banco de dados
        const [rows] = await connection.execute(`SELECT id, nome, preco, tipo, descricao FROM ProdutoBase WHERE id = ?`, [idProduto]);
        const produtoInfo = rows[0];
        if (!produtoInfo) {
            res.status(404).json({ success: false, message: 'Produto não encontrado.' });
            return;
        }
        // 2. Encontrar ou criar o carrinho para o cliente
        let idCarrinho;
        const [carrinhosResult] = await connection.execute(`SELECT idCarrinho FROM Carrinho WHERE idUsuario = ?`, [idCliente]);
        if (carrinhosResult.length > 0) {
            idCarrinho = carrinhosResult[0].idCarrinho;
        }
        else {
            // Criar um novo carrinho
            const [insertResult] = await connection.execute(`INSERT INTO Carrinho (idUsuario, dataCriacao, dataUltimaModificacao, total) VALUES (?, NOW(), NOW(), 0)`, [idCliente]);
            idCarrinho = insertResult.insertId;
        }
        // 3. Adicionar ou atualizar o item no carrinho
        // Usamos INSERT ... ON DUPLICATE KEY UPDATE para simplificar
        await connection.execute(`INSERT INTO ItemCarrinho (idCarrinho, idProduto, quantidade)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantidade = quantidade + VALUES(quantidade)`, [idCarrinho, idProduto, quantidade]);
        // 4. Atualizar o total do carrinho
        await atualizarTotalCarrinho(connection, idCarrinho);
        // 5. Buscar o carrinho atualizado para retornar na resposta
        const { carrinho: carrinhoAtualizado, itens: itensFormatados } = await obterDetalhesCarrinhoFormatado(connection, idCarrinho);
        await connection.commit();
        if (!carrinhoAtualizado) {
            // Isso não deveria acontecer se a transação foi bem-sucedida
            res.status(500).json({ success: false, message: 'Erro ao buscar carrinho atualizado.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Produto adicionado/atualizado no carrinho!', data: Object.assign(Object.assign({}, carrinhoAtualizado), { itens: itensFormatados }) });
    }
    catch (err) {
        if (connection)
            await connection.rollback();
        console.error("Erro ao adicionar produto ao carrinho:", err);
        next(err);
    }
    finally {
        if (connection)
            connection.release();
    }
};
exports.adicionarProdutoAoCarrinho = adicionarProdutoAoCarrinho;
// @route   POST /carrinho/remover
// @desc    Remove um produto do carrinho ou diminui sua quantidade
// @access  Private
const removerProdutoDoCarrinho = async (req, res, next) => {
    let connection = null;
    try {
        const idUsuarioLogado = req.headers['x-user-id'];
        const { idProduto, quantidade: quantidadeParaRemover } = req.body;
        if (!idUsuarioLogado) {
            res.status(403).json({ success: false, message: 'ID do usuário não fornecido no cabeçalho X-User-ID.' });
            return;
        }
        if (idProduto === undefined) {
            res.status(400).json({ success: false, message: 'idProduto é obrigatório.' });
            return;
        }
        const idCliente = parseInt(idUsuarioLogado);
        if (quantidadeParaRemover !== undefined && (typeof quantidadeParaRemover !== 'number' || quantidadeParaRemover <= 0)) {
            res.status(400).json({ success: false, message: 'Quantidade para remover deve ser um número positivo.' });
            return;
        }
        connection = await database_1.pool.getConnection();
        await connection.beginTransaction();
        // 1. Encontrar o carrinho do cliente
        const [carrinhosResult] = await connection.execute(`SELECT idCarrinho FROM Carrinho WHERE idUsuario = ?`, [idCliente]);
        if (carrinhosResult.length === 0) {
            res.status(404).json({ success: false, message: 'Carrinho não encontrado para este cliente.' });
            return;
        }
        const idCarrinho = carrinhosResult[0].idCarrinho;
        // 2. Verificar se o item existe no carrinho e obter sua quantidade atual
        const [itensCarrinho] = await connection.execute(`SELECT quantidade FROM ItemCarrinho WHERE idCarrinho = ? AND idProduto = ?`, [idCarrinho, idProduto]);
        if (itensCarrinho.length === 0) {
            res.status(404).json({ success: false, message: 'Produto não encontrado no carrinho.' });
            return;
        }
        const quantidadeAtual = itensCarrinho[0].quantidade;
        // 3. Lógica para remover ou atualizar a quantidade
        if (quantidadeParaRemover === undefined || quantidadeParaRemover >= quantidadeAtual) {
            // Remover o item completamente
            await connection.execute(`DELETE FROM ItemCarrinho WHERE idCarrinho = ? AND idProduto = ?`, [idCarrinho, idProduto]);
        }
        else {
            // Diminuir a quantidade
            const novaQuantidade = quantidadeAtual - quantidadeParaRemover;
            await connection.execute(`UPDATE ItemCarrinho SET quantidade = ? WHERE idCarrinho = ? AND idProduto = ?`, [novaQuantidade, idCarrinho, idProduto]);
        }
        // 4. Atualizar o total do carrinho
        await atualizarTotalCarrinho(connection, idCarrinho);
        // 5. Buscar o carrinho atualizado para retornar na resposta
        const { carrinho: carrinhoAtualizado, itens: itensFormatados } = await obterDetalhesCarrinhoFormatado(connection, idCarrinho);
        await connection.commit();
        // Mesmo que o carrinhoAtualizado seja null (improvável aqui), a estrutura da resposta será mantida
        res.status(200).json({ success: true, message: 'Produto removido/atualizado do carrinho!', data: carrinhoAtualizado ? Object.assign(Object.assign({}, carrinhoAtualizado), { itens: itensFormatados }) : null });
    }
    catch (err) {
        if (connection)
            await connection.rollback();
        console.error("Erro ao remover produto do carrinho:", err);
        next(err);
    }
    finally {
        if (connection)
            connection.release();
    }
};
exports.removerProdutoDoCarrinho = removerProdutoDoCarrinho;
//# sourceMappingURL=carrinhoController.js.map