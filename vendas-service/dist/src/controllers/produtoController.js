"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarProduto = exports.obterProdutoPorId = exports.listarProdutos = void 0;
const database_1 = require("../database");
// @route   GET /api/produtos
// @desc    Lista todos os produtos disponíveis
// @access  Public (ou Private, se necessitar de autenticação)
const listarProdutos = async (req, res, next) => {
    try {
        // Substitua o mock pela lógica do banco de dados:
        const [rows] = await database_1.pool.execute(`SELECT id, nome, preco, tipo, descricao FROM ProdutoBase ORDER BY nome ASC`);
        // Por enquanto, mantendo o mock para o código funcionar sem o BD configurado:
        res.status(200).json({ success: true, data: rows });
    }
    catch (err) {
        console.error("Erro ao buscar todos os produtos:", err);
        next(err); // Passa o erro para o próximo middleware de erro
    }
};
exports.listarProdutos = listarProdutos;
// @route   GET /api/produtos/:id
// @desc    Obtém um produto específico pelo seu ID
// @access  Public
const obterProdutoPorId = async (req, res, next) => {
    const { id } = req.params; // Pega o ID da URL
    try {
        const [rows] = await database_1.pool.execute(`SELECT id, nome, preco, tipo, descricao FROM ProdutoBase WHERE id = ?`, [id] // Passa o ID como parâmetro para a query, prevenindo SQL Injection
        );
        const produto = rows[0]; // O resultado da query (se houver) estará na primeira posição
        if (!produto) {
            res.status(404).json({ success: false, message: 'Produto não encontrado' });
            return;
        }
        res.status(200).json({ success: true, data: produto });
    }
    catch (err) {
        console.error(`Erro ao buscar produto com ID ${id}:`, err);
        next(err);
    }
};
exports.obterProdutoPorId = obterProdutoPorId;
// @route   POST /api/produtos
// @desc    Cria um novo produto
// @access  Private (geralmente requer autenticação de admin/vendedor)
const criarProduto = async (req, res, next) => {
    const connection = await database_1.pool.getConnection(); // Obter uma conexão para usar transação
    try {
        const { nome, preco, tipo, descricao } = req.body;
        // Validação básica
        if (!nome || typeof preco !== 'number' || preco < 0 || !tipo) {
            res.status(400).json({ success: false, message: 'Nome, tipo e um preço válido (número não negativo) são campos obrigatórios.' });
            return;
        }
        if (!['REMEDIO', 'BRINQUEDO', 'RACAO'].includes(tipo)) {
            res.status(400).json({ success: false, message: 'Tipo de produto inválido.' });
            return;
        }
        await connection.beginTransaction(); // Iniciar transação
        // Executa a query de inserção
        // O banco de dados deve gerar o ID automaticamente
        const [resultBase] = await connection.execute(`INSERT INTO ProdutoBase (nome, preco, tipo, descricao) VALUES (?, ?, ?, ?)`, [nome, preco, tipo, descricao]);
        // O 'insertId' está disponível no resultado para inserções
        const idProdutoBase = resultBase.insertId;
        // Inserir na tabela específica baseada no tipo
        switch (tipo) {
            case 'REMEDIO':
                await connection.execute('INSERT INTO Remedio (id_produto_base) VALUES (?)', [idProdutoBase]);
                break;
            case 'RACAO':
                await connection.execute('INSERT INTO Racao (id_produto_base) VALUES (?)', [idProdutoBase]);
                break;
            case 'BRINQUEDO':
                await connection.execute('INSERT INTO Brinquedo (id_produto_base) VALUES (?)', [idProdutoBase]);
                break;
        }
        await connection.commit(); // Confirmar transação
        // Retorna o produto criado (ou apenas o ID)
        res.status(201).json({ success: true, message: `Produto do tipo ${tipo} criado com sucesso!`, data: { id: idProdutoBase, nome, preco, tipo, descricao } });
    }
    catch (err) {
        if (connection)
            await connection.rollback(); // Reverter transação em caso de erro
        console.error("Erro ao criar produto:", err);
        next(err); // Passa o erro para o middleware de tratamento de erros
    }
    finally {
        if (connection)
            connection.release(); // Liberar conexão de volta para o pool
    }
};
exports.criarProduto = criarProduto;
//# sourceMappingURL=produtoController.js.map