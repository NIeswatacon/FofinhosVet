import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';
import { SERVER_PORT as CONFIG_SERVER_PORT } from '../config';
import './database';
import { Eureka } from 'eureka-js-client';

const server = express();

server.use(helmet());
// Configuração do CORS
// Permite requisições de qualquer origem para testes.
// Lembre-se de restringir para a URL do seu frontend em produção.
server.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
  credentials: true,
}));


server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(routes);

// Middleware de tratamento de erros
server.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erro não tratado:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Ocorreu um erro interno no servidor.',
  });
});

// Prioriza a porta do ambiente (ex: Railway), depois a do arquivo de config, e por último um padrão.
const PORT = process.env.PORT || CONFIG_SERVER_PORT || 3000;

const EUREKA_SERVER_URL_FALLBACK = 'http://localhost:8761/'; // Usar localhost para dev, e garantir que seja / se o Gateway estiver lá
// Garante que não haja barra dupla, removendo a barra final da URL base se existir
const eurekaBaseUrl = (process.env.EUREKA_URL || EUREKA_SERVER_URL_FALLBACK).replace(/\/$/, '');

// 2. Configuração do cliente Eureka para Railway e desenvolvimento local
const eurekaClient = new Eureka({
    instance: {
        app: 'VENDAS-SERVICE', // Nome exato que aparecerá no painel Eureka
        hostName: process.env.RAILWAY_PRIVATE_IP || 'localhost', // Usar IP privado para comunicação interna no Railway
        ipAddr: process.env.RAILWAY_PRIVATE_IP || '127.0.0.1',
        port: {
            '$': parseInt(process.env.PORT || (CONFIG_SERVER_PORT ? CONFIG_SERVER_PORT.toString() : '3000'), 10),
            '@enabled': true,
        },
        vipAddress: 'vendas-service', // Identificador do serviço
        // Para o Railway, as URLs de status e health check devem usar o domínio público e HTTPS
        statusPageUrl: process.env.RAILWAY_PUBLIC_DOMAIN
            ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/info`
            : `http://localhost:${PORT}/info`, // Para desenvolvimento local
        healthCheckUrl: process.env.RAILWAY_PUBLIC_DOMAIN
            ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/health`
            : `http://localhost:${PORT}/health`, // Para desenvolvimento local
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
       serviceUrls: {
            default: [ `${eurekaBaseUrl}/eureka/apps/` ]
        },
        ssl: eurekaBaseUrl.startsWith('https://'),
    },
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} em http://localhost:${PORT}`);
  
  // 3. Inicia o registro no Eureka e trata possíveis erros
  eurekaClient.start((error: Error) => {
      if (error) {
          console.error('❌ Erro ao registrar no Eureka:', error);
      } else {
          console.log('✅ Serviço de Vendas registrado no Eureka com sucesso!');
      }
  });
});