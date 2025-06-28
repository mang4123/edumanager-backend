import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Listar exercícios
router.get('/', (req, res) => {
  res.json({ 
    message: 'Lista de exercícios',
    data: [
      {
        id: 1,
        titulo: 'Equações do 2º grau',
        descricao: 'Resolva as equações propostas e justifique sua resposta',
        materia: 'Matemática',
        dificuldade: 'médio',
        prazo: '2024-01-25',
        status: 'enviado',
        dataEnvio: '2024-01-18',
        alunos: [
          { id: 1, nome: 'João Silva', status: 'pendente' },
          { id: 2, nome: 'Maria Santos', status: 'entregue' }
        ],
        pontuacao: 10,
        tipo: 'lista'
      },
      {
        id: 2,
        titulo: 'Leis de Newton',
        descricao: 'Questões sobre as três leis de Newton',
        materia: 'Física',
        dificuldade: 'fácil',
        prazo: '2024-01-22',
        status: 'corrigido',
        dataEnvio: '2024-01-15',
        alunos: [
          { id: 2, nome: 'Maria Santos', status: 'corrigido', nota: 9.0 }
        ],
        pontuacao: 8,
        tipo: 'questões'
      }
    ]
  });
});

// Detalhes de um exercício específico
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: 'Detalhes do exercício',
    data: {
      id: parseInt(id),
      titulo: 'Equações do 2º grau',
      descricao: 'Resolva as equações propostas e justifique sua resposta',
      materia: 'Matemática',
      dificuldade: 'médio',
      prazo: '2024-01-25',
      status: 'enviado',
      dataEnvio: '2024-01-18',
      pontuacao: 10,
      tipo: 'lista',
      questoes: [
        {
          numero: 1,
          enunciado: 'Resolva: x² - 5x + 6 = 0',
          tipo: 'calculo'
        },
        {
          numero: 2,
          enunciado: 'Encontre as raízes de: 2x² + 3x - 2 = 0',
          tipo: 'calculo'
        }
      ],
      material: ['Livro cap. 8', 'Videoaula #15'],
      observacoes: 'Foquem na demonstração do cálculo'
    }
  });
});

// Exercícios por aluno
router.get('/aluno/:alunoId', (req, res) => {
  const { alunoId } = req.params;
  res.json({
    message: 'Exercícios do aluno',
    data: [
      {
        id: 1,
        titulo: 'Equações do 2º grau',
        materia: 'Matemática',
        prazo: '2024-01-25',
        status: 'pendente',
        nota: null
      },
      {
        id: 2,
        titulo: 'Leis de Newton',
        materia: 'Física',
        prazo: '2024-01-22',
        status: 'corrigido',
        nota: 9.0
      }
    ]
  });
});

// Criar exercício (apenas professor)
router.post('/', (req, res) => {
  res.json({ 
    message: 'Exercício criado',
    data: {
      id: 3,
      ...req.body,
      status: 'criado',
      dataCriacao: new Date().toISOString()
    }
  });
});

// Enviar exercício para aluno
router.post('/:id/enviar', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Exercício enviado',
    data: {
      exercicioId: parseInt(id),
      alunosIds: req.body.alunosIds || [],
      dataEnvio: new Date().toISOString(),
      prazo: req.body.prazo,
      status: 'enviado'
    }
  });
});

// Responder exercício (apenas aluno)
router.post('/:id/resposta', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Resposta enviada',
    data: {
      exercicioId: parseInt(id),
      respostas: req.body.respostas || [],
      dataEntrega: new Date().toISOString(),
      status: 'entregue',
      observacoes: req.body.observacoes || ''
    }
  });
});

// Corrigir exercício (apenas professor)
router.post('/:id/correcao', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Exercício corrigido',
    data: {
      exercicioId: parseInt(id),
      alunoId: req.body.alunoId,
      nota: req.body.nota,
      feedback: req.body.feedback || '',
      dataCorrecao: new Date().toISOString(),
      status: 'corrigido'
    }
  });
});

// Relatório de exercícios
router.get('/relatorio', (req, res) => {
  res.json({
    message: 'Relatório de exercícios',
    data: {
      totalExercicios: 15,
      exerciciosEnviados: 12,
      exerciciosCorrigidos: 8,
      mediaNotas: 8.2,
      estatisticas: {
        facil: 5,
        medio: 7,
        dificil: 3
      },
      materias: {
        'Matemática': 8,
        'Física': 4,
        'Química': 3
      }
    }
  });
});

// Banco de questões
router.get('/questoes', (req, res) => {
  res.json({
    message: 'Banco de questões',
    data: [
      {
        id: 1,
        enunciado: 'Resolva: x² - 5x + 6 = 0',
        materia: 'Matemática',
        dificuldade: 'médio',
        tipo: 'calculo',
        tags: ['equação', 'segundo grau']
      },
      {
        id: 2,
        enunciado: 'Explique a primeira lei de Newton',
        materia: 'Física',
        dificuldade: 'fácil',
        tipo: 'teórica',
        tags: ['newton', 'leis']
      }
    ]
  });
});

export { router as exercicioRoutes }; 