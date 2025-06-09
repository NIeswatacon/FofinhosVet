import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';
import { SERVER_PORT } from '../config';
import './database';

// 1. Importar a biblioteca do Eureka e a de tipos que criaremos
import { Eureka } from 'eureka-js-client';

const server = express();

server.use(helmet());

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  optionsSuccessStatus: 200 
};
server.use(cors(corsOptions)); 

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

// 2. Configuração do cliente Eureka
const eurekaClient = new Eureka({
    instance: {
        app: 'VENDAS-SERVICE', // Nome exato que aparecerá no painel Eureka
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
        port: {
            '$': SERVER_PORT,
            '@enabled': true,
        },
        vipAddress: 'vendas-service', // Identificador do serviço
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        host: 'localhost',
        port: 8761, // Porta do seu Eureka Server
        servicePath: '/eureka/apps/',
    },
});

server.listen(SERVER_PORT, () => {
  console.log(`🚀 Servidor de Vendas rodando na porta ${SERVER_PORT}`);
  
  // 3. Inicia o registro no Eureka e trata possíveis erros
  eurekaClient.start((error: Error) => {
      if (error) {
          console.error('Erro ao registrar no Eureka:', error);
      } else {
          console.log('✅ Serviço de Vendas registrado no Eureka com sucesso!');
      }
  });
});