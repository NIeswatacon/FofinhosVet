"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const produtoController_1 = require("../controllers/produtoController");
const router = (0, express_1.Router)();
router.get('/', produtoController_1.listarProdutos); // Público
router.get('/:id', produtoController_1.obterProdutoPorId); // Público
router.post('/', produtoController_1.criarProduto); // Protegido? (Depende de regra de cargo: ADMIN ou GERENTE)
exports.default = router;
//# sourceMappingURL=produtoRoute.js.map