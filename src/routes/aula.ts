import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Listar aulas (professor e aluno)
router.get('/', (req, res) => {
  res.json({ 
    message: 'Lista de aulas',
    data: [
      {
        id: 1,
        aluno: {
          id: 1,
          nome: 'João Silva',
          email: 'joao@email.com'
        },
        professor: {
          id: 1,
          nome: 'Professor Exemplo',
          especialidade: 'Matemática'
        },
        data: '2024-01-20',
        horario: '14:00',
        duracao: 60,
        materia: 'Matemática',
        topico: 'Equações do 2º grau',
        status: 'agendada',
        tipo: 'presencial',
        valor: 100.00
      },
      {
        id: 2,
        aluno: {
          id: 2,
          nome: 'Maria Santos',
          email: 'maria@email.com'
        },
        professor: {
          id: 1,
          nome: 'Professor Exemplo',
          especialidade: 'Física'
        },
        data: '2024-01-20',
        horario: '16:00',
        duracao: 60,
        materia: 'Física',
        topico: 'Leis de Newton',
        status: 'agendada',
        tipo: 'online',
        valor: 100.00
      }
    ]
  });
});

// Detalhes de uma aula específica
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: 'Detalhes da aula',
    data: {
      id: parseInt(id),
      aluno: {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 88888-8888'
      },
      professor: {
        id: 1,
        nome: 'Professor Exemplo',
        especialidade: 'Matemática'
      },
      data: '2024-01-20',
      horario: '14:00',
      duracao: 60,
      materia: 'Matemática',
      topico: 'Equações do 2º grau',
      status: 'agendada',
      tipo: 'presencial',
      valor: 100.00,
      observacoes: 'Revisar exercícios da aula anterior',
      material: ['Livro capítulo 5', 'Lista de exercícios']
    }
  });
});

// Agendar aula (apenas professor)
router.post('/', (req, res) => {
  res.json({ 
    message: 'Aula agendada',
    data: {
      id: 3,
      ...req.body,
      status: 'agendada',
      dataCriacao: new Date().toISOString()
    }
  });
});

// Reagendar aula
router.put('/:id/reagendar', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Aula reagendada',
    data: {
      id: parseInt(id),
      ...req.body,
      status: 'reagendada',
      dataAlteracao: new Date().toISOString()
    }
  });
});

// Cancelar aula
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Aula cancelada',
    data: {
      id: parseInt(id),
      status: 'cancelada',
      dataCancelamento: new Date().toISOString(),
      motivo: req.body.motivo || 'Não informado'
    }
  });
});

// Marcar presença
router.post('/:id/presenca', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Presença marcada',
    data: {
      aulaId: parseInt(id),
      presente: req.body.presente || true,
      observacoes: req.body.observacoes || '',
      horarioMarcacao: new Date().toISOString()
    }
  });
});

// Histórico de aulas
router.get('/historico', (req, res) => {
  res.json({
    message: 'Histórico de aulas',
    data: [
      {
        id: 10,
        data: '2024-01-15',
        aluno: 'João Silva',
        materia: 'Matemática',
        status: 'realizada',
        presenca: true,
        nota: 8.5
      },
      {
        id: 11,
        data: '2024-01-12',
        aluno: 'Maria Santos',
        materia: 'Física',
        status: 'realizada',
        presenca: true,
        nota: 9.0
      }
    ]
  });
});

// === ROTAS ESPECÍFICAS PARA CALENDÁRIO ===
// Buscar aulas por data específica
router.get('/data/:data', (req, res) => {
  const { data } = req.params;
  console.log('=== BUSCAR AULAS POR DATA ===');
  console.log('Data solicitada:', data);
  
  // Simular aulas diferentes para datas diferentes
  const aulasExemplo = {
    '2024-06-04': [
      {
        id: 1,
        horario: '14:00',
        aluno: { nome: 'João Silva', id: 1 },
        materia: 'Matemática',
        tipo: 'presencial',
        status: 'agendada'
      },
      {
        id: 2,
        horario: '16:00',
        aluno: { nome: 'Maria Santos', id: 2 },
        materia: 'Física',
        tipo: 'online',
        status: 'agendada'
      },
      {
        id: 3,
        horario: '18:00',
        aluno: { nome: 'Carlos Oliveira', id: 3 },
        materia: 'Química',
        tipo: 'presencial',
        status: 'agendada'
      }
    ],
    '2024-06-05': [
      {
        id: 4,
        horario: '15:00',
        aluno: { nome: 'Ana Silva', id: 4 },
        materia: 'Matemática',
        tipo: 'online',
        status: 'agendada'
      }
    ],
    '2024-06-06': [
      {
        id: 5,
        horario: '10:00',
        aluno: { nome: 'Pedro Santos', id: 5 },
        materia: 'Português',
        tipo: 'presencial',
        status: 'agendada'
      },
      {
        id: 6,
        horario: '14:00',
        aluno: { nome: 'Lucia Costa', id: 6 },
        materia: 'História',
        tipo: 'online',
        status: 'agendada'
      }
    ]
  };
  
  const aulasData = (aulasExemplo as any)[data] || [];
  
  res.json({
    message: `Aulas para ${data}`,
    data: aulasData,
    total: aulasData.length
  });
});

// Buscar aulas de uma semana específica
router.get('/semana/:data', (req, res) => {
  const { data } = req.params;
  
  res.json({
    message: `Aulas da semana de ${data}`,
    data: [
      {
        dia: 'Segunda',
        data: '2024-06-03',
        aulas: 2
      },
      {
        dia: 'Terça', 
        data: '2024-06-04',
        aulas: 3
      },
      {
        dia: 'Quarta',
        data: '2024-06-05', 
        aulas: 1
      },
      {
        dia: 'Quinta',
        data: '2024-06-06',
        aulas: 2
      },
      {
        dia: 'Sexta',
        data: '2024-06-07',
        aulas: 0
      }
    ]
  });
});

// Agendar nova aula (rota POST melhorada)
router.post('/nova', (req, res) => {
  console.log('=== NOVA AULA ===');
  console.log('Dados recebidos:', req.body);
  
  const { aluno, data, horario, materia, tipo, observacoes } = req.body;
  
  res.json({
    message: 'Aula agendada com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 100,
      aluno,
      data,
      horario,
      materia,
      tipo: tipo || 'presencial',
      observacoes: observacoes || '',
      status: 'agendada',
      dataCriacao: new Date().toISOString()
    }
  });
});

export { router as aulaRoutes }; 