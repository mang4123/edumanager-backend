import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação e role de aluno para todas as rotas
router.use(authenticateToken);
router.use(requireRole(['aluno']));

// ==========================================
// TIPOS E INTERFACES
// ==========================================

interface MaterialAluno {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  materia: string;
  professor: string;
  dataEnvio: string;
  prazo?: string;
  status: string;
  arquivo: string;
  nota?: number;
  dataEntrega?: string;
  resposta?: string;
}

// ==========================================
// DADOS MOCK PARA ALUNOS
// ==========================================

const materiaisAluno: MaterialAluno[] = [
  {
    id: 1,
    titulo: "Lista de Álgebra",
    descricao: "Exercícios básicos de equações",
    tipo: "exercicio",
    materia: "Matemática",
    professor: "Professor Exemplo",
    dataEnvio: "2024-01-19",
    prazo: "2024-01-26",
    status: "pendente",
    arquivo: "/materiais/algebra-lista-1.pdf"
  },
  {
    id: 2,
    titulo: "Redação - Tema Livre",
    descricao: "Desenvolva uma redação de tema livre",
    tipo: "exercicio",
    materia: "Português",
    professor: "Professor Exemplo", 
    dataEnvio: "2024-01-17",
    prazo: "2024-01-24",
    status: "entregue",
    nota: 8.5,
    arquivo: "/materiais/redacao-tema-livre.pdf"
  },
  {
    id: 3,
    titulo: "Apostila de Química Orgânica",
    descricao: "Material de apoio para aulas",
    tipo: "material",
    materia: "Química",
    professor: "Professor Exemplo",
    dataEnvio: "2024-01-15",
    status: "disponivel",
    arquivo: "/materiais/quimica-organica.pdf"
  }
];

const duvidasAluno = [
  {
    id: 1,
    pergunta: "Como resolver equações do segundo grau?",
    materia: "Matemática",
    data: "2024-01-14",
    status: "respondida",
    urgencia: "normal",
    resposta: "Para resolver equações do 2º grau, use a fórmula de Bhaskara...",
    dataResposta: "2024-01-14"
  },
  {
    id: 2,
    pergunta: "Qual a diferença entre ser e estar em inglês?",
    materia: "Inglês",
    data: "2024-01-13",
    status: "pendente",
    urgencia: "baixa"
  }
];

const pagamentosAluno = {
  proximoPagamento: {
    valor: 120.00,
    vencimento: "2024-02-15",
    descricao: "Mensalidade - Fevereiro 2024"
  },
  historico: [
    {
      id: 1,
      periodo: "Janeiro 2024",
      valor: 120.00,
      status: "pago",
      dataPagamento: "2024-01-10"
    },
    {
      id: 2,
      periodo: "Dezembro 2023",
      valor: 120.00,
      status: "pago",
      dataPagamento: "2023-12-12"
    },
    {
      id: 3,
      periodo: "Novembro 2023",
      valor: 120.00,
      status: "atrasado",
      vencimento: "2023-11-15"
    }
  ]
};

// ==========================================
// ROTAS ALUNO
// ==========================================

// GET /api/aluno/profile - Perfil do aluno
router.get('/profile', (req, res) => {
  console.log('=== PERFIL DO ALUNO ===');
  
  const user = (req as any).user;
  
  const aluno = {
    id: user.id,
    nome: user.nome || 'Aluno',
    email: user.email,
    telefone: user.telefone || null,
    professor: {
      nome: "Professor Exemplo",
      especialidade: "Matemática e Português",
      telefone: "(11) 99999-9999"
    },
    estatisticas: {
      aulasRealizadas: 24,
      exerciciosPendentes: 3,
      materiaisDisponiveis: 2,
      proximaAula: {
        data: "2024-01-15",
        horario: "15:00",
        materia: "Matemática"
      }
    }
  };

  res.json({
    message: "Perfil do aluno",
    data: aluno
  });
});

// GET /api/aluno/aulas - Aulas do aluno
router.get('/aulas', (req, res) => {
  console.log('=== AULAS DO ALUNO ===');
  
  const aulas = [
    {
      id: 1,
      data: "2024-01-15",
      horario: "15:00",
      materia: "Matemática",
      professor: "Professor Exemplo",
      status: "agendada",
      tipo: "presencial",
      topico: "Equações do 2º grau"
    },
    {
      id: 2,
      data: "2024-01-12",
      horario: "14:00",
      materia: "Português",
      professor: "Professor Exemplo",
      status: "realizada",
      tipo: "online",
      topico: "Redação dissertativa",
      avaliacao: 5
    }
  ];

  res.json({
    message: "Aulas do aluno",
    data: aulas
  });
});

// GET /api/aluno/materiais - Materiais disponíveis
router.get('/materiais', (req, res) => {
  console.log('=== MATERIAIS DO ALUNO ===');
  
  res.json({
    message: "Materiais do aluno",
    data: materiaisAluno
  });
});

// GET /api/aluno/materiais/:id - Detalhes do material
router.get('/materiais/:id', (req, res) => {
  console.log('=== DETALHES DO MATERIAL ===');
  const materialId = parseInt(req.params.id);
  
  const material = materiaisAluno.find(m => m.id === materialId);
  
  if (!material) {
    return res.status(404).json({
      error: "Material não encontrado"
    });
  }

  res.json({
    message: "Detalhes do material",
    data: material
  });
});

// GET /api/aluno/materiais/:id/download - Download do material
router.get('/materiais/:id/download', (req, res) => {
  console.log('=== DOWNLOAD DO MATERIAL ===');
  const materialId = parseInt(req.params.id);
  const material = materiaisAluno.find(m => m.id === materialId);
  
  if (!material) {
    return res.status(404).json({
      error: "Material não encontrado"
    });
  }

  // Simular download
  res.json({
    message: "Download iniciado",
    data: {
      materialId: materialId,
      titulo: material.titulo,
      url: `https://edumanager-backend-5olt.onrender.com${material.arquivo}`,
      tipo: "application/pdf"
    }
  });
});

// GET /api/aluno/duvidas - Dúvidas do aluno
router.get('/duvidas', (req, res) => {
  console.log('=== DÚVIDAS DO ALUNO ===');
  
  res.json({
    message: "Dúvidas do aluno",
    data: duvidasAluno
  });
});

// POST /api/aluno/duvidas - Enviar nova dúvida
router.post('/duvidas', (req, res) => {
  console.log('=== ENVIAR NOVA DÚVIDA ===');
  const { pergunta, materia, urgencia = 'normal' } = req.body;
  
  if (!pergunta || !materia) {
    return res.status(400).json({
      error: "Pergunta e matéria são obrigatórias"
    });
  }

  const novaDuvida = {
    id: duvidasAluno.length + 1,
    pergunta,
    materia,
    data: new Date().toISOString().split('T')[0],
    status: "pendente",
    urgencia
  };

  duvidasAluno.push(novaDuvida);
  
  console.log('✅ Nova dúvida criada:', novaDuvida);

  res.status(201).json({
    message: "Dúvida enviada com sucesso",
    data: novaDuvida
  });
});

// GET /api/aluno/pagamentos - Informações de pagamento
router.get('/pagamentos', (req, res) => {
  console.log('=== PAGAMENTOS DO ALUNO ===');
  
  res.json({
    message: "Informações de pagamento",
    data: pagamentosAluno
  });
});

// POST /api/aluno/pagamentos/pagar - Processar pagamento
router.post('/pagamentos/pagar', (req, res) => {
  console.log('=== PROCESSAR PAGAMENTO ===');
  const { valor, metodo = 'cartao' } = req.body;
  
  if (!valor) {
    return res.status(400).json({
      error: "Valor é obrigatório"
    });
  }

  // Simular processamento de pagamento
  const pagamento = {
    id: Date.now(),
    valor,
    metodo,
    status: "processando",
    data: new Date().toISOString(),
    referencia: `PAG${Date.now()}`
  };

  console.log('💳 Pagamento processado:', pagamento);

  res.json({
    message: "Pagamento processado com sucesso",
    data: pagamento
  });
});

// GET /api/aluno/exercicios - Lista de exercícios recebidos
router.get('/exercicios', (req, res) => {
  console.log('=== EXERCÍCIOS DO ALUNO ===');
  
  const exercicios = materiaisAluno.filter(m => m.tipo === 'exercicio');
  
  res.json({
    message: "Lista de exercícios recebidos",
    data: exercicios
  });
});

// POST /api/aluno/exercicios/:id/entregar - Entregar exercício
router.post('/exercicios/:id/entregar', (req, res) => {
  console.log('=== ENTREGAR EXERCÍCIO ===');
  const exercicioId = parseInt(req.params.id);
  const { resposta, arquivo } = req.body;
  
  const exercicio = materiaisAluno.find(m => m.id === exercicioId && m.tipo === 'exercicio');
  
  if (!exercicio) {
    return res.status(404).json({
      error: "Exercício não encontrado"
    });
  }

  // Atualizar status do exercício
  exercicio.status = "entregue";
  exercicio.dataEntrega = new Date().toISOString().split('T')[0];
  exercicio.resposta = resposta;
  
  console.log('✅ Exercício entregue:', exercicio);

  res.json({
    message: "Exercício entregue com sucesso",
    data: exercicio
  });
});

export default router; 