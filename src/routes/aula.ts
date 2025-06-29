import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Request, Response } from 'express';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Tipo flexível para aulas
interface AulaBase {
  id: number;
  aluno: {
    id: number;
    nome: string;
    email: string;
  };
  professor: {
    id: number;
    nome: string;
    especialidade: string;
  };
  data: string;
  horario: string;
  duracao: number;
  materia: string;
  topico: string;
  status: string;
  tipo: string;
  valor: number;
  [key: string]: any; // Permite propriedades dinâmicas
}

// Sistema simples de "banco de dados" em memória para aulas
let aulasMemoria: AulaBase[] = [
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
    data: '2024-06-04',
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
    data: '2024-06-04',
    horario: '16:00',
    duracao: 60,
    materia: 'Física',
    topico: 'Leis de Newton',
    status: 'agendada',
    tipo: 'online',
    valor: 100.00
  },
  {
    id: 3,
    aluno: {
      id: 3,
      nome: 'Carlos Oliveira',
      email: 'carlos@email.com'
    },
    professor: {
      id: 1,
      nome: 'Professor Exemplo',
      especialidade: 'Química'
    },
    data: '2024-06-04',
    horario: '18:00',
    duracao: 60,
    materia: 'Química',
    topico: 'Reações Químicas',
    status: 'agendada',
    tipo: 'presencial',
    valor: 100.00
  }
];

// Listar aulas (professor e aluno)
router.get('/', (req, res) => {
  console.log('=== LISTAR TODAS AS AULAS ===');
  console.log('Total de aulas:', aulasMemoria.length);
  
  res.json({ 
    message: 'Lista de aulas',
    data: aulasMemoria
  });
});

// Detalhes de uma aula específica
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log('=== DETALHES DA AULA ===');
  console.log('Aula ID:', id);
  
  const aula = aulasMemoria.find(a => a.id === parseInt(id));
  
  if (!aula) {
    return res.status(404).json({
      message: 'Aula não encontrada',
      data: null
    });
  }
  
  return res.json({
    message: 'Detalhes da aula',
    data: {
      ...aula,
      observacoes: 'Revisar exercícios da aula anterior',
      material: ['Livro capítulo 5', 'Lista de exercícios']
    }
  });
});

// === ROTAS ESPECÍFICAS PARA CALENDÁRIO ===
// Buscar aulas por data específica
router.get('/data/:data', (req: Request, res: Response) => {
  console.log('=== BUSCAR AULAS POR DATA ===');
  const data = req.params.data;
  const user = (req as any).user;
  
  console.log(`Data solicitada: ${data}`);
  
  // Filtrar aulas baseado no tipo de usuário
  let aulasEncontradas = aulasMemoria.filter(aula => aula.data === data);
  
  // Se for aluno, mostrar apenas suas próprias aulas
  if (user.tipo === 'aluno') {
    aulasEncontradas = aulasEncontradas.filter(aula => 
      aula.aluno.email === user.email || 
      aula.aluno.id.toString() === user.id.toString()
    );
    console.log(`🧑‍🎓 FILTRO ALUNO: ${aulasEncontradas.length} aulas encontradas para o aluno`);
  }
  
  console.log(`Aulas encontradas para ${data} : ${aulasEncontradas.length}`);
  
  res.json({
    message: `Aulas para ${data}`,
    data: aulasEncontradas.map(aula => ({
      id: aula.id,
      horario: aula.horario,
      aluno: { 
        nome: aula.aluno?.nome || 'Aluno Desconhecido', 
        id: aula.aluno?.id || 0 
      },
      materia: aula.materia,
      tipo: aula.tipo,
      status: aula.status,
      duracao: aula.duracao,
      motivo: aula.motivo || null,
      dataCancelamento: aula.dataCancelamento || null
    })),
    total: aulasEncontradas.length
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
        aulas: aulasMemoria.filter(a => a.data === '2024-06-03').length
      },
      {
        dia: 'Terça', 
        data: '2024-06-04',
        aulas: aulasMemoria.filter(a => a.data === '2024-06-04').length
      },
      {
        dia: 'Quarta',
        data: '2024-06-05', 
        aulas: aulasMemoria.filter(a => a.data === '2024-06-05').length
      },
      {
        dia: 'Quinta',
        data: '2024-06-06',
        aulas: aulasMemoria.filter(a => a.data === '2024-06-06').length
      },
      {
        dia: 'Sexta',
        data: '2024-06-07',
        aulas: aulasMemoria.filter(a => a.data === '2024-06-07').length
      }
    ]
  });
});

// Agendar nova aula (rota POST melhorada)
router.post('/nova', (req, res) => {
  console.log('=== NOVA AULA ===');
  console.log('Dados recebidos:', req.body);
  
  const { aluno_id, data, horario, materia, tipo, observacoes } = req.body;
  
  // Buscar nome do aluno baseado no ID
  const alunosDisponiveis: Record<number, { nome: string; email: string }> = {
    1: { nome: 'João Silva', email: 'joao@email.com' },
    2: { nome: 'Maria Santos', email: 'maria@email.com' }
  };
  
  const alunoInfo = alunosDisponiveis[aluno_id] || { nome: 'Aluno Desconhecido', email: 'aluno@email.com' };
  
  // Criar nova aula e adicionar ao "banco"
  const novaAula = {
    id: Math.floor(Math.random() * 1000) + 100,
    aluno: {
      id: aluno_id || 1,
      nome: alunoInfo.nome,
      email: alunoInfo.email
    },
    professor: {
      id: 1,
      nome: 'Professor Exemplo',
      especialidade: materia || 'Geral'
    },
    data,
    horario,
    duracao: 60,
    materia: materia || 'Geral',
    topico: req.body.topico || 'Aula particular',
    status: 'agendada',
    tipo: tipo || 'presencial',
    valor: req.body.valor || 100.00
  };
  
  // Adicionar à lista em memória
  aulasMemoria.push(novaAula);
  
  console.log('✅ Aula criada e adicionada! Total de aulas:', aulasMemoria.length);
  console.log('Aluno cadastrado:', alunoInfo.nome);
  
  res.json({
    message: 'Aula agendada com sucesso',
    data: novaAula
  });
});

// Agendar aula (rota original melhorada)
router.post('/', requireRole(['professor']), (req: Request, res: Response) => {
  console.log('=== AGENDAR AULA (ROTA ORIGINAL) ===');
  const { aluno_id, data, horario, materia } = req.body;
  
  console.log('Dados recebidos:', { aluno_id, data, horario, materia });
  
  // Buscar nome do aluno baseado no ID
  const alunosDisponiveis: Record<number, { nome: string; email: string }> = {
    1: { nome: 'João Silva', email: 'joao@email.com' },
    2: { nome: 'Maria Santos', email: 'maria@email.com' }
  };
  
  const alunoInfo = alunosDisponiveis[aluno_id] || { nome: 'Aluno Desconhecido', email: 'aluno@email.com' };
  
  const novaAula = {
    id: Math.floor(Math.random() * 1000) + 200,
    aluno: {
      id: aluno_id || 1,
      nome: alunoInfo.nome,
      email: alunoInfo.email
    },
    professor: {
      id: 1,
      nome: 'Professor Exemplo',
      especialidade: materia || 'Geral'
    },
    data,
    horario,
    duracao: 60,
    materia: materia || 'Geral',
    topico: req.body.topico || 'Aula particular',
    status: 'agendada',
    tipo: req.body.tipo || 'presencial',
    valor: req.body.valor || 100.00
  };
  
  aulasMemoria.push(novaAula);
  
  console.log('✅ Aula agendada! Total:', aulasMemoria.length);
  console.log('Aluno cadastrado:', alunoInfo.nome);
  
  res.json({ 
    message: 'Aula agendada',
    data: novaAula
  });
});

// Editar aula
router.put('/:id', requireRole(['professor']), (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('=== EDITAR AULA ===');
  console.log('Aula ID:', id);
  console.log('Novos dados:', req.body);
  
  const aulaIndex = aulasMemoria.findIndex(a => a.id === parseInt(id));
  
  if (aulaIndex === -1) {
    return res.status(404).json({
      message: 'Aula não encontrada',
      data: null
    });
  }
  
  // Mapear aluno_id para dados do aluno
  let alunoAtualizado = aulasMemoria[aulaIndex].aluno;
  if (req.body.aluno_id) {
    const alunosMap: Record<number, { id: number; nome: string; email: string }> = {
      1: { id: 1, nome: 'João Silva', email: 'joao@email.com' },
      2: { id: 2, nome: 'Maria Santos', email: 'maria@email.com' }
    };
    alunoAtualizado = alunosMap[req.body.aluno_id] || alunoAtualizado;
  }
  
  // Atualizar aula corretamente
  aulasMemoria[aulaIndex] = {
    ...aulasMemoria[aulaIndex],
    aluno: alunoAtualizado,
    data: req.body.data || aulasMemoria[aulaIndex].data,
    horario: req.body.horario || aulasMemoria[aulaIndex].horario,
    materia: req.body.materia || aulasMemoria[aulaIndex].materia,
    tipo: req.body.tipo || aulasMemoria[aulaIndex].tipo,
    status: 'atualizada',
    dataAlteracao: new Date().toISOString()
  };
  
  console.log('✅ Aula atualizada:', aulasMemoria[aulaIndex]);
  
  return res.json({ 
    message: 'Aula atualizada com sucesso',
    data: aulasMemoria[aulaIndex]
  });
});

// Reagendar aula
router.put('/:id/reagendar', (req, res) => {
  const { id } = req.params;
  console.log('=== REAGENDAR AULA ===');
  console.log('Aula ID:', id);
  console.log('Novos dados:', req.body);
  
  const aulaIndex = aulasMemoria.findIndex(a => a.id === parseInt(id));
  
  if (aulaIndex === -1) {
    return res.status(404).json({
      message: 'Aula não encontrada',
      data: null
    });
  }
  
  // Atualizar aula
  aulasMemoria[aulaIndex] = {
    ...aulasMemoria[aulaIndex],
    ...req.body,
    status: 'reagendada',
    dataAlteracao: new Date().toISOString()
  };
  
  return res.json({ 
    message: 'Aula reagendada',
    data: aulasMemoria[aulaIndex]
  });
});

// Cancelar aula
router.delete('/:id', requireRole(['professor']), (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('=== CANCELAR AULA ===');
  console.log('Aula ID:', id);
  
  const aulaIndex = aulasMemoria.findIndex(a => a.id === parseInt(id));
  
  if (aulaIndex === -1) {
    return res.status(404).json({
      message: 'Aula não encontrada',
      data: null
    });
  }
  
  aulasMemoria[aulaIndex].status = 'cancelada';
  aulasMemoria[aulaIndex].dataCancelamento = new Date().toISOString();
  aulasMemoria[aulaIndex].motivo = req.body.motivo || 'Não informado';
  
  return res.json({ 
    message: 'Aula cancelada',
    data: aulasMemoria[aulaIndex]
  });
});

// Marcar presença
router.post('/:id/presenca', (req, res) => {
  const { id } = req.params;
  console.log('=== MARCAR PRESENÇA ===');
  console.log('Aula ID:', id);
  
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
  console.log('=== HISTÓRICO DE AULAS ===');
  
  const aulasRealizadas = aulasMemoria.filter(a => a.status === 'realizada');
  
  res.json({
    message: 'Histórico de aulas',
    data: aulasRealizadas.map(aula => ({
      id: aula.id,
      data: aula.data,
      aluno: aula.aluno.nome,
      materia: aula.materia,
      status: aula.status,
      presenca: true,
      nota: Math.floor(Math.random() * 3) + 8 // Nota aleatória entre 8-10
    }))
  });
});

export { router as aulaRoutes }; 