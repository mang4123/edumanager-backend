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
import { authenticateToken } from './middleware/auth';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: true, // Permite qualquer origem (temporário para debug)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging detalhado para debug
app.use((req, res, next) => {
  console.log('=== REQUEST LOG ===');
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers.authorization ? 'Auth present' : 'No auth');
  console.log('Body:', Object.keys(req.body).length > 0 ? req.body : 'Empty');
  console.log('Query:', Object.keys(req.query).length > 0 ? req.query : 'Empty');
  console.log('=== END REQUEST LOG ===');
  next();
});

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

// === ROTAS ESPECÍFICAS PARA FUNCIONALIDADES ===
// Rota específica para listar alunos (pode ser chamada diretamente)
app.get('/api/alunos', authenticateToken, (req, res) => {
  res.json({
    message: 'Lista geral de alunos',
    data: [
      {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 88888-8888',
        status: 'ativo',
        materias: ['Matemática'],
        ultimaAula: '2024-01-18'
      },
      {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria@email.com',
        telefone: '(11) 77777-7777',
        status: 'ativo',
        materias: ['Física', 'Química'],
        ultimaAula: '2024-01-17'
      },
      {
        id: 3,
        nome: 'Carlos Oliveira',
        email: 'carlos@email.com',
        telefone: '(11) 66666-6666',
        status: 'ativo',
        materias: ['Matemática', 'Física'],
        ultimaAula: '2024-01-16'
      }
    ]
  });
});

// Rota específica para exercícios (pode ser chamada diretamente)
app.get('/api/exercicios', authenticateToken, (req, res) => {
  res.json({
    message: 'Lista geral de exercícios',
    data: [
      {
        id: 1,
        titulo: 'Equações do 2º grau',
        materia: 'Matemática',
        status: 'enviado',
        alunos: 3,
        prazo: '2024-01-25'
      },
      {
        id: 2,
        titulo: 'Leis de Newton',
        materia: 'Física',
        status: 'corrigido',
        alunos: 2,
        prazo: '2024-01-22'
      },
      {
        id: 3,
        titulo: 'Funções Trigonométricas',
        materia: 'Matemática',
        status: 'criado',
        alunos: 0,
        prazo: '2024-01-30'
      }
    ]
  });
});

// Rota específica para dúvidas (pode ser chamada diretamente)
app.get('/api/duvidas', authenticateToken, (req, res) => {
  res.json({
    message: 'Lista geral de dúvidas',
    data: [
      {
        id: 1,
        aluno: 'Ana Silva',
        pergunta: 'Como resolver equações do segundo grau?',
        materia: 'Matemática',
        data: '2024-01-14',
        status: 'pendente'
      },
      {
        id: 2,
        aluno: 'Carlos Santos',
        pergunta: 'Qual a diferença entre ser e estar?',
        materia: 'Português',
        data: '2024-01-13',
        status: 'respondida'
      }
    ]
  });
});

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