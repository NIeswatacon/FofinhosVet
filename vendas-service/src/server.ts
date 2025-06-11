import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes';
import './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8084;

// Configuração do CORS
app.use(cors({
  origin: ['*'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Accept'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 3600
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erro não tratado:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Ocorreu um erro interno no servidor.',
  });
});

app.listen(PORT, () => {
  console.log(`✅ Serviço de Vendas rodando na porta ${PORT}`);
});