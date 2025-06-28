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
  console.log('==========================================');
  console.log('🔥 NOVA REQUISIÇÃO DETECTADA');
  console.log('==========================================');
  console.log(`📍 ${req.method} ${req.originalUrl}`);
  console.log(`📱 User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);
  console.log(`🔐 Auth Header: ${req.headers.authorization ? '✅ PRESENTE' : '❌ AUSENTE'}`);
  console.log(`📦 Body Keys: ${Object.keys(req.body).length > 0 ? Object.keys(req.body).join(', ') : 'VAZIO'}`);
  console.log(`🔍 Query Params: ${Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : 'VAZIO'}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('==========================================');
  
  // Interceptar resposta para log
  const originalSend = res.send;
  res.send = function(data) {
    console.log('📤 RESPOSTA ENVIADA:');
    console.log(`📍 ${req.method} ${req.originalUrl}`);
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📝 Response: ${typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200)}...`);
    console.log('==========================================');
    return originalSend.call(this, data);
  };
  
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

// === ROTAS ESPECÍFICAS PARA AÇÕES ===
// Responder dúvida
app.post('/api/duvidas/:id/responder', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { resposta } = req.body;
  
  console.log('=== RESPONDER DÚVIDA (ROTA DIRETA) ===');
  console.log('Dúvida ID:', id);
  console.log('Resposta:', resposta);
  
  res.json({
    message: 'Dúvida respondida com sucesso',
    data: {
      duvidaId: parseInt(id),
      resposta,
      dataResposta: new Date().toISOString(),
      status: 'respondida'
    }
  });
});

// Criar exercício (rota direta)
app.post('/api/exercicios/criar', authenticateToken, (req, res) => {
  console.log('=== CRIAR EXERCÍCIO (ROTA DIRETA) ===');
  console.log('Dados recebidos:', req.body);
  
  const { titulo, descricao, materia, prazo, alunos } = req.body;
  
  res.json({
    message: 'Exercício criado com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 300,
      titulo,
      descricao,
      materia,
      prazo,
      alunos: alunos || [],
      status: 'criado',
      dataCriacao: new Date().toISOString()
    }
  });
});

// Enviar exercício (rota direta)
app.post('/api/exercicios/:id/enviar', authenticateToken, (req, res) => {
  const { id } = req.params;
  console.log('=== ENVIAR EXERCÍCIO (ROTA DIRETA) ===');
  console.log('Exercício ID:', id);
  console.log('Dados:', req.body);
  
  res.json({
    message: 'Exercício enviado com sucesso',
    data: {
      exercicioId: parseInt(id),
      status: 'enviado',
      dataEnvio: new Date().toISOString()
    }
  });
});

// Ver exercício (rota direta)
app.get('/api/exercicios/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  console.log('=== VER EXERCÍCIO (ROTA DIRETA) ===');
  console.log('Exercício ID:', id);
  
  res.json({
    message: 'Detalhes do exercício',
    data: {
      id: parseInt(id),
      titulo: 'Exercício de Matemática',
      descricao: 'Resolver equações propostas',
      materia: 'Matemática',
      status: 'ativo',
      alunos: [
        { nome: 'João Silva', status: 'pendente' },
        { nome: 'Maria Santos', status: 'entregue' }
      ]
    }
  });
});

// Nova aula (rotas alternativas)
app.post('/api/aulas/nova', authenticateToken, (req, res) => {
  console.log('=== NOVA AULA (ROTA ALTERNATIVA) ===');
  console.log('Dados recebidos:', req.body);
  
  res.json({
    message: 'Aula criada com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 400,
      ...req.body,
      status: 'agendada',
      dataCriacao: new Date().toISOString()
    }
  });
});

// Agendar aula (rota específica)
app.post('/api/agendar-aula', authenticateToken, (req, res) => {
  console.log('=== AGENDAR AULA (ROTA ESPECÍFICA) ===');
  console.log('Dados recebidos:', req.body);
  
  res.json({
    message: 'Aula agendada com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 500,
      ...req.body,
      status: 'agendada',
      dataAgendamento: new Date().toISOString()
    }
  });
});

// Contato com aluno (rota direta)
app.post('/api/alunos/:id/contato', authenticateToken, (req, res) => {
  const { id } = req.params;
  console.log('=== CONTATO ALUNO (ROTA DIRETA) ===');
  console.log('Aluno ID:', id);
  console.log('Dados:', req.body);
  
  res.json({
    message: 'Contato enviado com sucesso',
    data: {
      alunoId: parseInt(id),
      status: 'enviado',
      dataEnvio: new Date().toISOString()
    }
  });
});

// Histórico do aluno (rota direta)
app.get('/api/alunos/:id/historico', authenticateToken, (req, res) => {
  const { id } = req.params;
  console.log('=== HISTÓRICO ALUNO (ROTA DIRETA) ===');
  console.log('Aluno ID:', id);
  
  res.json({
    message: 'Histórico do aluno',
    data: {
      alunoId: parseInt(id),
      aulas: [
        { data: '2024-01-15', materia: 'Matemática', nota: 8.5 },
        { data: '2024-01-12', materia: 'Física', nota: 9.0 }
      ],
      estatisticas: {
        totalAulas: 2,
        mediaNotas: 8.75
      }
    }
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