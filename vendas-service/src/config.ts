import dotenv from 'dotenv';

dotenv.config();

export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASS = process.env.DB_PASS || '';
export const DB_NAME = process.env.DB_NAME || 'vendas_db';
export const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; 