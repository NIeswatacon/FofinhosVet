"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const produtoRoute_1 = __importDefault(require("./produtoRoute"));
const carrinhoRoute_1 = __importDefault(require("./carrinhoRoute"));
const router = (0, express_1.Router)();
exports.router = router;
router.get('/', (req, res) => {
    res.send('API de Vendas está operacional!');
});
router.use('/produtos', produtoRoute_1.default);
router.use('/carrinho', carrinhoRoute_1.default);
//# sourceMappingURL=index.js.map