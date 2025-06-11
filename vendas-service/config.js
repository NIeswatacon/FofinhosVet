"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.SERVER_PORT = exports.DB_PORT = exports.DB_NAME = exports.DB_PASS = exports.DB_USER = exports.DB_HOST = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Carrega as variáveis de ambiente do .env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '.env') });
// Banco de dados
exports.DB_HOST = process.env.DB_HOST;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASS = process.env.DB_PASS;
exports.DB_NAME = process.env.DB_NAME;
exports.DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
// Servidor
exports.SERVER_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8086;
// JWT
exports.JWT_SECRET = process.env.JWT_SECRET;
// Validações obrigatórias
if (!exports.DB_HOST || !exports.DB_USER || !exports.DB_NAME) {
    console.error("❌ ERRO FATAL: Variáveis de configuração do banco de dados estão faltando!");
    process.exit(1);
}
if (!exports.JWT_SECRET) {
    console.error("❌ ERRO FATAL: JWT_SECRET não está definido no arquivo .env!");
    process.exit(1);
}
//# sourceMappingURL=config.js.map