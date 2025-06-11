"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const carrinhoController_1 = require("../controllers/carrinhoController");
const router = (0, express_1.Router)();
// Todas as rotas dependem de autenticação e leitura do cabeçalho X-User-ID
router.get('/', carrinhoController_1.listarProdutosDoCarrinho); // Lista os itens do carrinho do usuário autenticado
router.post('/adicionar', carrinhoController_1.adicionarProdutoAoCarrinho); // Adiciona item ao carrinho do usuário autenticado
router.post('/remover', carrinhoController_1.removerProdutoDoCarrinho); // Remove item do carrinho do usuário autenticado
exports.default = router;
//# sourceMappingURL=carrinhoRoute.js.map