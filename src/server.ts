import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { professorRoutes } from './routes/professor';
import { alunoRoutes } from './routes/aluno';
import { aulaRoutes } from './routes/aula';
import { exercicioRoutes } from './routes/exercicio';
import { financeiroRoutes } from './routes/financeiro';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://lovable.dev',
    'https://app.lovable.dev',
    'https://preview.lovable.dev',
    /^https:\/\/.*\.lovable\.dev$/,
    /^https:\/\/lovable\.dev$/,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'EduManager API está funcionando!',
    timestamp: new Date().toISOString() 
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/aluno', alunoRoutes);
app.use('/api/aula', aulaRoutes);
app.use('/api/exercicio', exercicioRoutes);
app.use('/api/financeiro', financeiroRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EduManager API rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
}); 