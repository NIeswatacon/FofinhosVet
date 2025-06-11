"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
require("./database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8084;
// Configuração do CORS
app.use((0, cors_1.default)({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Accept'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 3600
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(routes_1.router);
// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error("Erro não tratado:", err.stack || err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Ocorreu um erro interno no servidor.',
    });
});
app.listen(PORT, () => {
    console.log(`✅ Serviço de Vendas rodando na porta ${PORT}`);
});
//# sourceMappingURL=server.js.map