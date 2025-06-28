import { Router } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
router.use(requireRole(['professor']));

// Dashboard do professor - dados principais
router.get('/dashboard', (req, res) => {
  res.json({ 
    message: 'Dashboard do professor',
    data: {
      totalAlunos: 12,
      aulasHoje: 3,
      proximaAula: {
        id: 1,
        aluno: 'João Silva',
        horario: '14:00',
        materia: 'Matemática'
      },
      estatisticas: {
        aulasRealizadas: 45,
        exerciciosCorrigidos: 23,
        receita: 2500.00
      }
    }
  });
});

// Perfil do professor
router.get('/profile', (req: AuthRequest, res) => {
  res.json({
    message: 'Perfil do professor',
    data: {
      id: req.user?.id,
      nome: 'Professor Exemplo',
      email: req.user?.email,
      especialidade: 'Matemática',
      telefone: '(11) 99999-9999',
      bio: 'Professor experiente em matemática'
    }
  });
});

// Gerenciar alunos
router.get('/alunos', (req, res) => {
  res.json({ 
    message: 'Lista de alunos',
    data: [
      {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 88888-8888',
        status: 'ativo'
      },
      {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria@email.com',
        telefone: '(11) 77777-7777',
        status: 'ativo'
      }
    ]
  });
});

// Rota para compatibilidade com frontend (students = alunos)
router.get('/students', (req, res) => {
  res.json({ 
    message: 'Lista de alunos', 
    data: [
      {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 88888-8888',
        status: 'ativo'
      },
      {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria@email.com',
        telefone: '(11) 77777-7777',
        status: 'ativo'
      }
    ]
  });
});

// Detalhes de um aluno específico
router.get('/alunos/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: 'Detalhes do aluno',
    data: {
      id: parseInt(id),
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 88888-8888',
      status: 'ativo',
      aulas: 10,
      exercicios: 5,
      pagamentos: [
        { data: '2024-01-15', valor: 100, status: 'pago' }
      ]
    }
  });
});

router.post('/alunos/convite', (req, res) => {
  res.json({ message: 'Convite enviado para aluno' });
});

// Aulas
router.get('/aulas', (req, res) => {
  res.json({ 
    message: 'Lista de aulas do professor',
    data: [
      {
        id: 1,
        aluno: 'João Silva',
        data: '2024-01-20',
        horario: '14:00',
        materia: 'Matemática',
        status: 'agendada'
      },
      {
        id: 2,
        aluno: 'Maria Santos',
        data: '2024-01-20',
        horario: '16:00',
        materia: 'Física',
        status: 'agendada'
      }
    ]
  });
});

router.post('/aulas', (req, res) => {
  res.json({ 
    message: 'Aula criada',
    data: {
      id: 3,
      ...req.body,
      status: 'agendada'
    }
  });
});

// Exercícios
router.get('/exercicios', (req, res) => {
  res.json({ 
    message: 'Lista de exercícios',
    data: [
      {
        id: 1,
        titulo: 'Equações do 2º grau',
        materia: 'Matemática',
        alunos: ['João Silva', 'Maria Santos'],
        status: 'enviado',
        dataEnvio: '2024-01-18'
      },
      {
        id: 2,
        titulo: 'Leis de Newton',
        materia: 'Física',
        alunos: ['Maria Santos'],
        status: 'corrigido',
        dataEnvio: '2024-01-15'
      }
    ]
  });
});

router.post('/exercicios', (req, res) => {
  res.json({ 
    message: 'Exercício criado',
    data: {
      id: 3,
      ...req.body,
      status: 'criado'
    }
  });
});

// Financeiro
router.get('/financeiro', (req, res) => {
  res.json({ 
    message: 'Relatório financeiro',
    data: {
      totalRecebido: 2500.00,
      totalPendente: 800.00,
      mesAtual: 1500.00,
      pagamentosRecentes: [
        {
          id: 1,
          aluno: 'João Silva',
          valor: 100.00,
          data: '2024-01-20',
          status: 'pago'
        },
        {
          id: 2,
          aluno: 'Maria Santos',
          valor: 100.00,
          data: '2024-01-18',
          status: 'pendente'
        }
      ]
    }
  });
});

// Configurações
router.get('/config', (req, res) => {
  res.json({
    message: 'Configurações do professor',
    data: {
      notificacoes: true,
      emailLembrete: true,
      horarioDisponivel: {
        inicio: '08:00',
        fim: '18:00'
      }
    }
  });
});

router.post('/config', (req, res) => {
  res.json({
    message: 'Configurações atualizadas',
    data: req.body
  });
});

// Notificações
router.get('/notificacoes', (req, res) => {
  res.json({
    message: 'Notificações',
    data: [
      {
        id: 1,
        tipo: 'aula',
        titulo: 'Aula agendada',
        descricao: 'Nova aula com João Silva às 14:00',
        data: '2024-01-20',
        lida: false
      },
      {
        id: 2,
        tipo: 'pagamento',
        titulo: 'Pagamento recebido',
        descricao: 'Pagamento de R$ 100 de Maria Santos',
        data: '2024-01-18',
        lida: true
      }
    ]
  });
});

// Estatísticas
router.get('/stats', (req: AuthRequest, res) => {
  res.json({
    message: 'Estatísticas',
    data: {
      aulasTotal: 45,
      alunosAtivos: 12,
      exerciciosEnviados: 23,
      taxaSucesso: 85,
      receitaTotal: 2500.00,
      crescimentoMensal: 15
    }
  });
});

// === ROTAS PARA DÚVIDAS ===
// Listar dúvidas dos alunos
router.get('/duvidas', (req: AuthRequest, res) => {
  res.json({
    message: 'Dúvidas dos alunos',
    data: [
      {
        id: 1,
        aluno: {
          id: 1,
          nome: 'Ana Silva',
          foto: '/api/placeholder/32/32'
        },
        pergunta: 'Como resolver equações do segundo grau?',
        materia: 'Matemática',
        data: '2024-01-14',
        status: 'pendente',
        urgencia: 'normal'
      },
      {
        id: 2,
        aluno: {
          id: 2,
          nome: 'Carlos Santos',
          foto: '/api/placeholder/32/32'
        },
        pergunta: 'Qual a diferença entre ser e estar?',
        materia: 'Português',
        data: '2024-01-13',
        status: 'respondida',
        resposta: 'Ser indica características permanentes, estar indica estados temporários.',
        dataResposta: '2024-01-13',
        urgencia: 'baixa'
      }
    ]
  });
});

// Responder uma dúvida específica
router.post('/duvidas/:id/responder', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { resposta } = req.body;
  
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

// Marcar dúvida como resolvida
router.patch('/duvidas/:id/resolver', (req: AuthRequest, res) => {
  const { id } = req.params;
  
  res.json({
    message: 'Dúvida marcada como resolvida',
    data: {
      duvidaId: parseInt(id),
      status: 'resolvida',
      dataResolucao: new Date().toISOString()
    }
  });
});

export { router as professorRoutes }; 