import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
// import { authRoutes } from './routes/auth'; // Removido - usando Supabase Auth diretamente
import { professorRoutes } from './routes/professor';
import alunoRoutes from './routes/aluno';
import studentRoutes from './routes/student';
import { aulaRoutes } from './routes/aula';
import { exercicioRoutes } from './routes/exercicio';
import { financeiroRoutes } from './routes/financeiro';
import { startJobScheduler } from './jobs/scheduler';

import { authenticateToken, requireRole } from './middleware/auth';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// === INTERFACES ===
interface ConviteGerado {
  id: string;
  professorId: string;
  nomeAluno: string;
  emailAluno: string;
  telefoneAluno: string;
  token: string;
  linkConvite: string;
  dataGeracao: string;
  validoAte: string;
  usado: boolean;
}

interface ExercicioEnviado {
  id: number;
  exercicioId: number;
  professorId: string;
  alunosIds: number[];
  titulo: string;
  descricao: string;
  materia: string;
  prazo: string;
  dataEnvio: string;
  status: 'enviado' | 'em_andamento' | 'concluido';
}

interface DuvidaBidirecional {
  id: number;
  alunoId: string;
  professorId: string;
  pergunta: string;
  resposta?: string;
  materia: string;
  data: string;
  dataResposta?: string;
  status: 'pendente' | 'respondida' | 'resolvida';
  urgencia: 'baixa' | 'normal' | 'alta';
}

interface NotificacaoSistema {
  id: number;
  usuarioId: string;
  tipo: 'aula' | 'exercicio' | 'pagamento' | 'duvida' | 'resposta';
  titulo: string;
  descricao: string;
  data: string;
  lida: boolean;
  urgencia: 'baixa' | 'normal' | 'alta';
  acao?: {
    tipo: 'link' | 'modal' | 'redirect';
    url?: string;
    dados?: any;
  };
}

// === ESTADO GLOBAL EM MEMÓRIA ===
const exerciciosEnviados: ExercicioEnviado[] = [];
const duvidasSistema: DuvidaBidirecional[] = [];
const notificacoesSistema: NotificacaoSistema[] = [];
const convitesGerados: ConviteGerado[] = [];

// === FUNÇÕES AUXILIARES ===
function criarNotificacao(
  usuarioId: string, 
  tipo: NotificacaoSistema['tipo'], 
  titulo: string, 
  descricao: string,
  urgencia: 'baixa' | 'normal' | 'alta' = 'normal',
  acao?: NotificacaoSistema['acao']
) {
  const notificacao: NotificacaoSistema = {
    id: Date.now() + Math.random(),
    usuarioId,
    tipo,
    titulo,
    descricao,
    data: new Date().toISOString(),
    lida: false,
    urgencia,
    acao
  };
  
  notificacoesSistema.push(notificacao);
  return notificacao;
}

function enviarNotificacaoEmail(email: string, assunto: string, mensagem: string) {
  return {
    enviado: true,
    provedor: 'NodeMailer + Gmail',
    timestamp: new Date().toISOString()
  };
}

function enviarNotificacaoSMS(telefone: string, mensagem: string) {
  return {
    enviado: true,
    provedor: 'Twilio API',
    timestamp: new Date().toISOString()
  };
}

// === MIDDLEWARE BÁSICO ===
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === MIDDLEWARE DE ESTADO GLOBAL ===
app.use((req: any, res, next) => {
  req.estadoGlobal = {
    exerciciosEnviados,
    duvidasSistema,
    notificacoesSistema,
    convitesGerados,
    criarNotificacao,
    enviarNotificacaoEmail,
    enviarNotificacaoSMS
  };
  next();
});

// === ROTA DE SAÚDE ===
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// === ROTAS PRINCIPAIS ===
// app.use('/api/auth', authRoutes); // Removido - usando Supabase Auth diretamente
app.use('/api/professor', authenticateToken, requireRole(['professor']), professorRoutes);
app.use('/api/aluno', authenticateToken, requireRole(['aluno']), alunoRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/aula', aulaRoutes);
app.use('/api/exercicio', authenticateToken, exercicioRoutes);
app.use('/api/financeiro', financeiroRoutes);


// === ROTAS AUXILIARES ===
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
      }
    ]
  });
});

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
      }
    ]
  });
});

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

// === ROTAS DE AGENDA ===
app.post('/api/agenda/nova-aula', authenticateToken, (req, res) => {
  res.json({
    message: 'Aula criada via agenda',
    data: {
      id: Math.floor(Math.random() * 1000) + 600,
      ...req.body,
      status: 'agendada',
      fonte: 'agenda'
    }
  });
});

app.get('/api/agenda/aulas', authenticateToken, (req, res) => {
  const { data } = req.query;
  
  res.json({
    message: 'Aulas da agenda',
    data: [
      {
        id: 1,
        data: data || '2024-06-04',
        horario: '14:00',
        aluno: 'João Silva',
        materia: 'Matemática'
      }
    ]
  });
});

// === MIDDLEWARE DE ERRO PARA ROTAS NÃO ENCONTRADAS ===
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Rota não encontrada',
      method: req.method,
      url: req.originalUrl,
      suggestion: 'Verifique se a rota está implementada corretamente'
    });
  }
  
  return res.status(404).json({
    error: 'Página não encontrada'
  });
});

// === INICIALIZAÇÃO DO SERVIDOR ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  // Iniciar jobs de sincronização
  startJobScheduler();
});

// Tratamento de erros global
app.use(errorHandler); 