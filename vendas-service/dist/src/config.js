"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.DB_PORT = exports.DB_NAME = exports.DB_PASS = exports.DB_USER = exports.DB_HOST = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.DB_HOST = process.env.DB_HOST || 'localhost';
exports.DB_USER = process.env.DB_USER || 'root';
exports.DB_PASS = process.env.DB_PASS || '';
exports.DB_NAME = process.env.DB_NAME || 'vendas_db';
exports.DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
exports.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
//# sourceMappingURL=config.js.map