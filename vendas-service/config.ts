import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Banco de dados
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

// Servidor
export const SERVER_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8086;

// JWT
export const JWT_SECRET = process.env.JWT_SECRET;

// Validações obrigatórias
if (!DB_HOST || !DB_USER || !DB_NAME) {
  console.error("❌ ERRO FATAL: Variáveis de configuração do banco de dados estão faltando!");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("❌ ERRO FATAL: JWT_SECRET não está definido no arquivo .env!");
  process.exit(1);
}
