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

// GET /api/aluno/materiais - Materiais disponíveis - CONECTADO AO SISTEMA GLOBAL
router.get('/materiais', (req: any, res) => {
  const alunoId = req.user?.id;
  
  console.log('=== MATERIAIS DO ALUNO (SISTEMA GLOBAL) ===');
  console.log('Aluno ID:', alunoId);
  console.log('Total exercícios enviados:', req.estadoGlobal?.exerciciosEnviados?.length || 0);
  
  // Filtrar exercícios enviados especificamente para este aluno
  const exerciciosAluno = req.estadoGlobal?.exerciciosEnviados?.filter(
    (exercicio: any) => exercicio.alunosIds.includes(1) || exercicio.alunosIds.includes(parseInt(alunoId?.slice(-1) || '1'))
  ) || [];
  
  console.log('Exercícios encontrados para este aluno:', exerciciosAluno.length);
  
  // Converter exercícios para formato de materiais
  const materiaisExercicios = exerciciosAluno.map((exercicio: any) => ({
    id: exercicio.exercicioId,
    titulo: exercicio.titulo,
    descricao: exercicio.descricao,
    tipo: 'exercicio',
    materia: exercicio.materia,
    professor: 'Professor Exemplo',
    dataEnvio: exercicio.dataEnvio.split('T')[0],
    prazo: exercicio.prazo,
    status: 'pendente',
    arquivo: `${exercicio.titulo.toLowerCase().replace(/\s+/g, '_')}.pdf`,
    nota: null
  }));
  
  // Combinar materiais enviados com os padrão
  const todosMateriais = [...materiaisExercicios, ...materiaisAluno];
  
  return res.json({
    message: "Materiais do aluno",
    data: todosMateriais
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

  return res.json({
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
  return res.json({
    message: "Download iniciado",
    data: {
      materialId: materialId,
      titulo: material.titulo,
      url: `https://edumanager-backend-5olt.onrender.com${material.arquivo}`,
      tipo: "application/pdf"
    }
  });
});

// GET /api/aluno/duvidas - Dúvidas do aluno - BIDIRECIONAL
router.get('/duvidas', (req: any, res) => {
  const alunoId = req.user?.id;
  
  console.log('=== DÚVIDAS DO ALUNO (BIDIRECIONAL) ===');
  console.log('Aluno ID:', alunoId);
  console.log('Total dúvidas no sistema:', req.estadoGlobal?.duvidasSistema?.length || 0);
  
  // Filtrar dúvidas específicas deste aluno do sistema global
  const duvidasSistemaAluno = req.estadoGlobal?.duvidasSistema?.filter(
    (duvida: any) => duvida.alunoId === alunoId
  ) || [];
  
  console.log('Dúvidas encontradas no sistema para este aluno:', duvidasSistemaAluno.length);
  
  // Combinar dúvidas do sistema com as locais
  const todasDuvidas = [...duvidasSistemaAluno, ...duvidasAluno];
  
  return res.json({
    message: "Dúvidas do aluno",
    data: todasDuvidas.map((duvida: any) => ({
      id: duvida.id,
      pergunta: duvida.pergunta,
      materia: duvida.materia,
      data: duvida.data,
      status: duvida.status,
      urgencia: duvida.urgencia,
      resposta: duvida.resposta || null,
      dataResposta: duvida.dataResposta || null
    }))
  });
});

// POST /api/aluno/duvidas - Enviar nova dúvida - BIDIRECIONAL
router.post('/duvidas', (req: any, res) => {
  console.log('=== ENVIAR NOVA DÚVIDA (BIDIRECIONAL) ===');
  const { pergunta, materia, urgencia = 'normal' } = req.body;
  const alunoId = req.user?.id;
  const professorId = 'c6374029-c01f-4073-a9f2-3819c9bc1339'; // Professor padrão
  
  if (!pergunta || !materia) {
    return res.status(400).json({
      error: "Pergunta e matéria são obrigatórias"
    });
  }

  const novaDuvida = {
    id: Date.now() + Math.random(),
    alunoId: alunoId,
    professorId: professorId,
    pergunta,
    materia,
    data: new Date().toISOString().split('T')[0],
    status: "pendente",
    urgencia
  };

  // Adicionar à lista local
  duvidasAluno.push({
    id: novaDuvida.id,
    pergunta,
    materia,
    data: novaDuvida.data,
    status: "pendente",
    urgencia
  });

  // Adicionar ao sistema global (bidirecional)
  req.estadoGlobal.duvidasSistema.push(novaDuvida);
  
  // Criar notificação para o professor
  req.estadoGlobal.criarNotificacao(
    professorId,
    'duvida',
    'Nova dúvida recebida',
    `Um aluno enviou uma dúvida sobre ${materia}: ${pergunta.substring(0, 50)}...`,
    urgencia === 'alta' ? 'alta' : 'normal',
    {
      tipo: 'redirect',
      url: '/professor/duvidas',
      dados: { duvidaId: novaDuvida.id }
    }
  );
  
  // Enviar email para o professor (simulado)
  req.estadoGlobal.enviarNotificacaoEmail(
    'professor@email.com',
    'Nova Dúvida - EduManager',
    `Um aluno enviou uma nova dúvida sobre ${materia}:\n\n"${pergunta}"\n\nAcesse sua área para responder.`
  );
  
  console.log('✅ Nova dúvida criada e enviada ao professor:', novaDuvida);
  console.log('📊 Total dúvidas no sistema:', req.estadoGlobal.duvidasSistema.length);

  return res.status(201).json({
    message: "Dúvida enviada com sucesso",
    data: {
      ...novaDuvida,
      professorNotificado: true,
      emailEnviado: true
    }
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

  return res.json({
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

  return res.json({
    message: "Exercício entregue com sucesso",
    data: exercicio
  });
});

// === SISTEMA DE DESMARCAR AULA COM 24H ANTECEDÊNCIA ===
// Desmarcar aula
router.delete('/aulas/:aulaId/desmarcar', (req, res) => {
  const { aulaId } = req.params;
  const { motivo } = req.body;
  
  console.log('=== DESMARCAR AULA (ALUNO) ===');
  console.log('Aula ID:', aulaId);
  console.log('Motivo:', motivo);
  
  // Simular verificação de 24h de antecedência
  const aulaData = '2024-07-02T15:00:00Z'; // Data fictícia da aula
  const agora = new Date();
  const dataAula = new Date(aulaData);
  const diffHoras = (dataAula.getTime() - agora.getTime()) / (1000 * 60 * 60);
  
  if (diffHoras < 24) {
    return res.status(400).json({
      message: 'Não é possível desmarcar a aula',
      data: {
        permitido: false,
        motivo: 'Cancelamento deve ser feito com pelo menos 24 horas de antecedência',
        horasRestantes: Math.ceil(diffHoras),
        politica: 'Para cancelamentos em menos de 24h, entre em contato diretamente com o professor'
      }
    });
  }
  
  return res.json({
    message: 'Aula desmarcada com sucesso',
    data: {
      aulaId: parseInt(aulaId),
      status: 'cancelada_aluno',
      motivo: motivo || 'Cancelado pelo aluno',
      dataCancelamento: new Date().toISOString(),
      reembolso: diffHoras >= 48 ? 'total' : 'parcial',
      novaAulaPermitida: true
    }
  });
});

// Verificar se pode desmarcar aula
router.get('/aulas/:aulaId/pode-desmarcar', (req, res) => {
  const { aulaId } = req.params;
  
  console.log('=== VERIFICAR CANCELAMENTO ===');
  console.log('Aula ID:', aulaId);
  
  // Simular dados da aula
  const aulaData = '2024-07-02T15:00:00Z';
  const agora = new Date();
  const dataAula = new Date(aulaData);
  const diffHoras = (dataAula.getTime() - agora.getTime()) / (1000 * 60 * 60);
  
  res.json({
    message: 'Verificação de cancelamento',
    data: {
      aulaId: parseInt(aulaId),
      podeDesmarcar: diffHoras >= 24,
      horasRestantes: Math.ceil(diffHoras),
      dataLimite: new Date(dataAula.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      politicas: {
        '48h+': 'Reembolso total',
        '24-48h': 'Reembolso parcial (50%)',
        '<24h': 'Sem reembolso - contate o professor'
      }
    }
  });
});

// === UPLOAD DE EXERCÍCIOS/MATERIAIS ===
// Upload de resposta de exercício
router.post('/exercicios/:id/upload', (req, res) => {
  const { id } = req.params;
  const { arquivos, tipoUpload = 'exercicio', observacoes } = req.body;
  
  console.log('=== UPLOAD EXERCÍCIO (ALUNO) ===');
  console.log('Exercício ID:', id);
  console.log('Tipo:', tipoUpload);
  console.log('Arquivos simulados:', arquivos?.length || 0);
  
  // Simular upload de arquivos
  const uploadId = Math.random().toString(36).substr(2, 9);
  
  res.json({
    message: 'Upload realizado com sucesso',
    data: {
      uploadId,
      exercicioId: parseInt(id),
      arquivos: arquivos || [
        {
          nome: 'resposta_exercicio.pdf',
          tamanho: '2.1MB',
          tipo: 'application/pdf',
          url: `/uploads/aluno/${uploadId}/resposta_exercicio.pdf`
        }
      ],
      tipoUpload,
      observacoes: observacoes || '',
      dataUpload: new Date().toISOString(),
      status: 'enviado_para_correcao'
    }
  });
});

// Listar uploads do aluno
router.get('/uploads', (req, res) => {
  console.log('=== LISTAR UPLOADS DO ALUNO ===');
  
  res.json({
    message: 'Lista de uploads',
    data: [
      {
        id: 1,
        exercicioId: 1,
        arquivo: 'matematica_lista1.pdf',
        tamanho: '1.5MB',
        dataUpload: '2024-01-20T14:30:00Z',
        status: 'corrigido',
        nota: 8.5
      },
      {
        id: 2,
        exercicioId: 2,
        arquivo: 'redacao_tema_livre.docx',
        tamanho: '850KB',
        dataUpload: '2024-01-18T16:45:00Z',
        status: 'pendente_correcao',
        nota: null
      }
    ]
  });
});

// === SISTEMA DE NOTIFICAÇÕES PARA ALUNO ===
// Configurar notificações do aluno
router.post('/notificacoes/configurar', (req, res) => {
  const {
    lembreteAula1h,
    lembreteExercicioPrazo,
    notificarNotas,
    notificarMateriais,
    email,
    sms
  } = req.body;
  
  console.log('=== CONFIGURAR NOTIFICAÇÕES ALUNO ===');
  console.log('Configurações:', req.body);
  
  res.json({
    message: 'Notificações configuradas com sucesso',
    data: {
      configuracoes: {
        lembreteAula1h: lembreteAula1h !== false,
        lembreteExercicioPrazo: lembreteExercicioPrazo !== false,
        notificarNotas: notificarNotas !== false,
        notificarMateriais: notificarMateriais !== false,
        canaisAtivos: {
          email: email !== false,
          sms: sms || false
        }
      },
      proximasNotificacoes: [
        {
          tipo: 'aula',
          titulo: 'Aula de Matemática em 1 hora',
          agendadaPara: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }
      ],
      dataAtualizacao: new Date().toISOString()
    }
  });
});

// Listar notificações do aluno - CONECTADO AO SISTEMA GLOBAL
router.get('/notificacoes', (req: any, res) => {
  const alunoId = req.user?.id;
  
  console.log('=== NOTIFICAÇÕES DO ALUNO (SISTEMA GLOBAL) ===');
  console.log('Aluno ID:', alunoId);
  console.log('Total notificações no sistema:', req.estadoGlobal?.notificacoesSistema?.length || 0);
  
  // Filtrar notificações específicas do aluno
  const notificacesAluno = req.estadoGlobal?.notificacoesSistema?.filter(
    (notif: any) => notif.usuarioId === alunoId
  ) || [];
  
  console.log('Notificações encontradas para este aluno:', notificacesAluno.length);
  
  // Notificações padrão
  const notificacoesPadrao = [
    {
      id: 1,
      tipo: 'aula',
      titulo: 'Sua aula começa em 1 hora',
      descricao: '29/06/2025, 03:09:08',
      data: new Date().toISOString(),
      lida: false,
      urgencia: 'alta',
      acao: {
        texto: 'Ver detalhes da aula',
        url: '/aluno/aulas/1'
      }
    },
    {
      id: 2,
      tipo: 'exercicio',
      titulo: 'Prazo de exercício expira em 2 dias',
      descricao: '24/01/2024, 07:00:00',
      data: '2024-01-24T10:00:00Z',
      lida: false,
      urgencia: 'normal',
      acao: {
        texto: 'Fazer exercício',
        url: '/aluno/materiais/1'
      }
    },
    {
      id: 3,
      tipo: 'nota',
      titulo: 'Nova nota disponível',
      descricao: '23/01/2024, 13:30:00',
      data: '2024-01-23T16:30:00Z',
      lida: true,
      urgencia: 'baixa',
      acao: {
        texto: 'Ver feedback',
        url: '/aluno/exercicios/2'
      }
    }
  ];
  
  // Combinar notificações específicas com as padrão
  const todasNotificacoes = [...notificacesAluno, ...notificacoesPadrao];
  
  return res.json({
    message: 'Notificações do aluno',
    data: todasNotificacoes.map((notif: any) => ({
      id: notif.id,
      tipo: notif.tipo,
      titulo: notif.titulo,
      descricao: notif.descricao,
      data: notif.data,
      lida: notif.lida || false,
      urgencia: notif.urgencia || 'normal',
      acao: notif.acao || {
        texto: 'Ver detalhes',
        url: '#'
      }
    }))
  });
});

// Marcar notificação como lida - PATCH
router.patch('/notificacoes/:id/lida', (req, res) => {
  const { id } = req.params;
  
  console.log('=== MARCAR NOTIFICAÇÃO LIDA (PATCH) ===');
  console.log('Notificação ID:', id);
  
  return res.json({
    message: 'Notificação marcada como lida',
    data: {
      notificacaoId: parseInt(id),
      lida: true,
      dataLeitura: new Date().toISOString()
    }
  });
});

// Marcar notificação como lida - POST (compatibilidade)
router.post('/notificacoes/:id/lida', (req, res) => {
  const { id } = req.params;
  
  console.log('=== MARCAR NOTIFICAÇÃO LIDA (POST) ===');
  console.log('Notificação ID:', id);
  
  return res.json({
    message: 'Notificação marcada como lida',
    data: {
      notificacaoId: parseInt(id),
      lida: true,
      dataLeitura: new Date().toISOString()
    }
  });
});

// === SISTEMA DE AGENDA PARA ALUNO ===
// Marcar nova aula (se permitido pelo professor)
router.post('/aulas/solicitar', (req, res) => {
  const { dataPreferida, horarioPreferida, materia, observacoes } = req.body;
  
  console.log('=== SOLICITAR NOVA AULA ===');
  console.log('Dados:', { dataPreferida, horarioPreferida, materia });
  
  res.json({
    message: 'Solicitação de aula enviada',
    data: {
      id: Math.floor(Math.random() * 1000) + 300,
      dataPreferida,
      horarioPreferida,
      materia: materia || 'A definir',
      observacoes: observacoes || '',
      status: 'aguardando_confirmacao_professor',
      dataSolicitacao: new Date().toISOString(),
      prazoResposta: '48 horas'
    }
  });
});

// Visualizar próximas aulas com notificação
router.get('/aulas/proximas', (req, res) => {
  console.log('=== PRÓXIMAS AULAS (COM NOTIFICAÇÃO) ===');
  
  const agora = new Date();
  const proximaAula = new Date(agora.getTime() + 2 * 60 * 60 * 1000); // 2 horas
  
  res.json({
    message: 'Próximas aulas',
    data: [
      {
        id: 1,
        data: proximaAula.toISOString().split('T')[0],
        horario: proximaAula.toTimeString().substr(0, 5),
        materia: 'Matemática',
        professor: 'Professor Exemplo',
        status: 'confirmada',
        tipo: 'presencial',
        tempoRestante: '2 horas',
        notificacao: {
          ativa: true,
          proximoAviso: new Date(proximaAula.getTime() - 60 * 60 * 1000).toISOString(), // 1h antes
          podeDesmarcar: true
        }
      }
    ],
    configuracoes: {
      avisoAntesDaAula: '1 hora',
      lembretesPorEmail: true,
      permiteCancelamento: true,
      prazoMinimoCancelamento: '24 horas'
    }
  });
});

export default router; 