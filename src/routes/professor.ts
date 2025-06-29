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
  console.log('=== DETALHES DO ALUNO ===');
  console.log('Aluno ID:', id);
  
  // Dados do aluno baseados no ID
  const alunos: Record<string, { nome: string; email: string }> = {
    '1': { nome: 'João Silva', email: 'joao@email.com' },
    '2': { nome: 'Maria Santos', email: 'maria@email.com' }
  };
  
  const aluno = alunos[id] || { nome: 'Aluno Desconhecido', email: 'aluno@email.com' };
  
  res.json({
    message: 'Detalhes do aluno',
    data: {
      id: parseInt(id),
      nome: aluno.nome,
      email: aluno.email,
      telefone: '(11) 88888-8888',
      status: 'ativo',
      aulas: 10,
      exercicios: 5,
      proximaAula: {
        id: 1,
        data: '2025-07-02',
        horario: '15:00',
        materia: 'Matemática',
        status: 'agendada'
      },
      pagamentos: [
        { data: '2024-01-15', valor: 100, status: 'pago' }
      ]
    }
  });
});

// === SISTEMA DE CONVITE POR LINK EXCLUSIVO ===
// Gerar link de convite para aluno
router.post('/alunos/convite', (req: AuthRequest, res) => {
  const { nomeAluno, emailAluno, telefoneAluno } = req.body;
  
  console.log('=== GERAR CONVITE EXCLUSIVO ===');
  console.log('Professor ID:', req.user?.id);
  console.log('Dados do aluno:', { nomeAluno, emailAluno, telefoneAluno });
  
  // Gerar token único para o convite
  const conviteToken = Buffer.from(`${req.user?.id}-${emailAluno}-${Date.now()}`).toString('base64');
  const linkConvite = `https://preview--tutor-class-organize.lovable.app/aluno/cadastro?convite=${conviteToken}&professor=${req.user?.id}`;
  
  res.json({
    message: 'Link de convite gerado com sucesso',
    data: {
      conviteToken,
      linkConvite,
      nomeAluno,
      emailAluno,
      telefoneAluno,
      professorId: req.user?.id,
      validoAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      dataGeracao: new Date().toISOString()
    }
  });
});

// Validar convite
router.get('/convites/:token/validar', (req: AuthRequest, res) => {
  const { token } = req.params;
  
  console.log('=== VALIDAR CONVITE ===');
  console.log('Token:', token);
  
  try {
    // Decodificar token (simplificado para demonstração)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [professorId, email, timestamp] = decoded.split('-');
    
    // Verificar se o convite não expirou (7 dias)
    const dataGeracao = new Date(parseInt(timestamp));
    const agora = new Date();
    const diffDias = (agora.getTime() - dataGeracao.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDias > 7) {
      return res.status(400).json({
        message: 'Convite expirado',
        data: { valido: false, motivo: 'Convite válido por apenas 7 dias' }
      });
    }
    
    return res.json({
      message: 'Convite válido',
      data: {
        valido: true,
        professorId,
        emailConvidado: email,
        diasRestantes: Math.ceil(7 - diffDias)
      }
    });
    
  } catch (error) {
    return res.status(400).json({
      message: 'Token de convite inválido',
      data: { valido: false, motivo: 'Token malformado ou inválido' }
    });
  }
});

// === ÁREA DE GRAVAÇÃO PREMIUM (BLOQUEADA) ===
// Acessar gravações (bloqueado)
router.get('/gravacoes', (req: AuthRequest, res) => {
  console.log('=== ÁREA DE GRAVAÇÃO (PREMIUM) ===');
  
  res.json({
    message: 'Área Premium - Gravação de Aulas',
    data: {
      bloqueado: true,
      planoAtual: 'Gratuito',
      recursosPremium: [
        'Gravação de aulas em HD',
        'Armazenamento ilimitado',
        'Compartilhamento com alunos',
        'Controle de acesso por aula',
        'Relatórios de visualização'
      ],
      linkUpgrade: 'https://edumanager.com/upgrade',
      precoMensal: 29.90,
      desconto: '30% OFF por tempo limitado'
    }
  });
});

// Tentar iniciar gravação (bloqueado)
router.post('/gravacoes/iniciar', (req: AuthRequest, res) => {
  console.log('=== TENTATIVA DE GRAVAÇÃO (BLOQUEADA) ===');
  
  res.status(402).json({
    message: 'Recurso Premium - Upgrade necessário',
    data: {
      recurso: 'gravacao_aulas',
      bloqueado: true,
      motivo: 'Disponível apenas no plano Premium',
      linkUpgrade: 'https://edumanager.com/upgrade',
      beneficios: [
        'Gravações em HD',
        'Sem limite de tempo',
        'Acesso dos alunos',
        'Backup automático'
      ]
    }
  });
});

// === COMENTÁRIOS PRIVADOS SOBRE AULAS ===
// Adicionar comentário privado sobre aula
router.post('/aulas/:aulaId/comentario', (req: AuthRequest, res) => {
  const { aulaId } = req.params;
  const { comentario, privado = true } = req.body;
  
  console.log('=== COMENTÁRIO PRIVADO AULA ===');
  console.log('Aula ID:', aulaId);
  console.log('Comentário:', comentario);
  
  res.json({
    message: 'Comentário adicionado com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 500,
      aulaId: parseInt(aulaId),
      professorId: req.user?.id,
      comentario,
      privado,
      dataComentario: new Date().toISOString(),
      editavel: true
    }
  });
});

// Listar comentários de uma aula
router.get('/aulas/:aulaId/comentarios', (req: AuthRequest, res) => {
  const { aulaId } = req.params;
  
  console.log('=== LISTAR COMENTÁRIOS AULA ===');
  console.log('Aula ID:', aulaId);
  
  res.json({
    message: 'Comentários da aula',
    data: [
      {
        id: 1,
        comentario: 'Aluno teve dificuldade com equações. Revisar na próxima aula.',
        privado: true,
        dataComentario: '2024-01-15T16:30:00Z',
        editavel: true
      },
      {
        id: 2,
        comentario: 'Excelente progresso em álgebra. Pode avançar para funções.',
        privado: true,
        dataComentario: '2024-01-12T14:45:00Z',
        editavel: true
      }
    ]
  });
});

// === ÁREAS DE ATUAÇÃO ESPECÍFICAS ===
// Listar áreas de atuação disponíveis
router.get('/areas-atuacao', (req: AuthRequest, res) => {
  console.log('=== ÁREAS DE ATUAÇÃO DISPONÍVEIS ===');
  
  res.json({
    message: 'Áreas de atuação disponíveis',
    data: {
      categorias: [
        {
          categoria: 'Reforço Escolar',
          areas: [
            'Matemática - Ensino Fundamental',
            'Matemática - Ensino Médio',
            'Português - Ensino Fundamental',
            'Português - Ensino Médio',
            'Ciências - Ensino Fundamental',
            'Física - Ensino Médio',
            'Química - Ensino Médio',
            'Biologia - Ensino Médio',
            'História',
            'Geografia',
            'Redação e Escrita'
          ]
        },
        {
          categoria: 'Idiomas',
          areas: [
            'Inglês',
            'Espanhol',
            'Francês',
            'Alemão',
            'Italiano',
            'Japonês',
            'Mandarim',
            'Português para Estrangeiros'
          ]
        },
        {
          categoria: 'Música',
          areas: [
            'Piano',
            'Violão',
            'Guitarra',
            'Bateria',
            'Violino',
            'Flauta',
            'Saxofone',
            'Canto e Vocal',
            'Teoria Musical',
            'Produção Musical'
          ]
        },
        {
          categoria: 'Atividade Física',
          areas: [
            'Personal Trainer',
            'Yoga',
            'Pilates',
            'Funcional',
            'Musculação',
            'Crossfit',
            'Dança',
            'Artes Marciais',
            'Natação',
            'Corrida e Atletismo'
          ]
        },
        {
          categoria: 'Tecnologia',
          areas: [
            'Programação - Python',
            'Programação - JavaScript',
            'Programação - Java',
            'Design Gráfico',
            'Edição de Vídeo',
            'Excel Avançado',
            'PowerPoint',
            'Photoshop',
            'Ilustrator',
            'Marketing Digital'
          ]
        },
        {
          categoria: 'Preparatórios',
          areas: [
            'ENEM',
            'Vestibular',
            'Concursos Públicos',
            'OAB',
            'Residência Médica',
            'Pós-Graduação',
            'MBA',
            'Certificações TI'
          ]
        }
      ],
      permitirOutros: true,
      campoPersonalizado: 'Outra área de atuação'
    }
  });
});

// === SISTEMA DE NOTIFICAÇÕES DE AULA ===
// Configurar notificações
router.post('/notificacoes/configurar', (req: AuthRequest, res) => {
  const { 
    lembreteAula24h, 
    lembreteAula1h, 
    notificarPagamento,
    notificarNovasDuvidas,
    email,
    sms 
  } = req.body;
  
  console.log('=== CONFIGURAR NOTIFICAÇÕES ===');
  console.log('Configurações:', req.body);
  
  res.json({
    message: 'Notificações configuradas com sucesso',
    data: {
      professorId: req.user?.id,
      configuracoes: {
        lembreteAula24h: lembreteAula24h || true,
        lembreteAula1h: lembreteAula1h || true,
        notificarPagamento: notificarPagamento || true,
        notificarNovasDuvidas: notificarNovasDuvidas || true,
        canaisAtivos: {
          email: email || true,
          sms: sms || false
        }
      },
      dataAtualizacao: new Date().toISOString()
    }
  });
});

// === LINKS DE PAGAMENTO PIX/CARTÃO ===
// Gerar link de pagamento
router.post('/pagamentos/gerar-link', (req: AuthRequest, res) => {
  const { alunoId, valor, descricao, vencimento, metodosPermitidos } = req.body;
  
  console.log('=== GERAR LINK PAGAMENTO ===');
  console.log('Dados:', { alunoId, valor, descricao, metodosPermitidos });
  
  const linkId = Math.random().toString(36).substr(2, 9);
  
  res.json({
    message: 'Link de pagamento gerado com sucesso',
    data: {
      linkId,
      url: `https://edumanager.com/pagar/${linkId}`,
      qrCodePix: `https://edumanager.com/qr/${linkId}`,
      dadosPix: {
        chave: 'professor@email.com',
        nomeRecebedor: (req.user as any)?.nome || 'Professor',
        valor: parseFloat(valor),
        descricao: descricao || 'Pagamento de aulas'
      },
      metodosDisponiveis: metodosPermitidos || ['pix', 'cartao', 'boleto'],
      valor: parseFloat(valor),
      vencimento: vencimento || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ativo',
      dataGeracao: new Date().toISOString()
    }
  });
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
// Lista de dúvidas em memória
let duvidasMemoria: any[] = [
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
];

// Listar dúvidas dos alunos
router.get('/duvidas', (req: AuthRequest, res) => {
  console.log('=== LISTAR DÚVIDAS ===');
  console.log('Total de dúvidas em memória:', duvidasMemoria.length);
  
  res.json({
    message: 'Dúvidas dos alunos',
    data: duvidasMemoria
  });
});

// Responder uma dúvida específica
router.post('/duvidas/:id/responder', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { resposta } = req.body;
  
  console.log('=== RESPONDER DÚVIDA ===');
  console.log('Dúvida ID:', id);
  console.log('Resposta:', resposta);
  
  // Encontrar e atualizar a dúvida na lista
  const duvidaIndex = duvidasMemoria.findIndex(d => d.id === parseInt(id));
  
  if (duvidaIndex !== -1) {
    duvidasMemoria[duvidaIndex] = {
      ...duvidasMemoria[duvidaIndex],
      status: 'respondida',
      resposta,
      dataResposta: new Date().toISOString()
    };
    
    console.log('✅ Dúvida atualizada:', duvidasMemoria[duvidaIndex]);
  } else {
    console.log('❌ Dúvida não encontrada');
  }
  
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

// === ROTAS PARA AÇÕES DOS ALUNOS ===
// Contato com aluno
router.post('/alunos/:id/contato', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { mensagem, tipo } = req.body;
  
  console.log('=== CONTATO COM ALUNO ===');
  console.log('Aluno ID:', id);
  console.log('Dados:', { mensagem, tipo });
  
  res.json({
    message: 'Contato enviado com sucesso',
    data: {
      alunoId: parseInt(id),
      mensagem,
      tipo: tipo || 'email',
      dataEnvio: new Date().toISOString(),
      status: 'enviado'
    }
  });
});

// Histórico do aluno
router.get('/alunos/:id/historico', (req: AuthRequest, res) => {
  const { id } = req.params;
  
  console.log('=== HISTÓRICO DO ALUNO ===');
  console.log('Aluno ID:', id);
  
  res.json({
    message: 'Histórico do aluno',
    data: {
      alunoId: parseInt(id),
      aulas: [
        {
          id: 1,
          data: '2024-01-15',
          materia: 'Matemática',
          status: 'realizada',
          nota: 8.5,
          presenca: true
        },
        {
          id: 2,
          data: '2024-01-12',
          materia: 'Física',
          status: 'realizada',
          nota: 9.0,
          presenca: true
        }
      ],
      exercicios: [
        {
          id: 1,
          titulo: 'Equações do 2º grau',
          dataEnvio: '2024-01-10',
          status: 'entregue',
          nota: 8.0
        }
      ],
      estatisticas: {
        totalAulas: 2,
        mediaNotas: 8.75,
        percentualPresenca: 100
      }
    }
  });
});

// === ROTAS PARA AÇÕES DOS EXERCÍCIOS ===
// Criar exercício
router.post('/exercicios/criar', (req: AuthRequest, res) => {
  console.log('=== CRIAR EXERCÍCIO ===');
  console.log('Dados recebidos:', req.body);
  
  const { titulo, descricao, materia, prazo, alunos } = req.body;
  
  res.json({
    message: 'Exercício criado com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 100,
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

// Enviar exercício
router.post('/exercicios/:id/enviar', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { alunosIds, prazo } = req.body;
  
  console.log('=== ENVIAR EXERCÍCIO ===');
  console.log('Exercício ID:', id);
  console.log('Dados:', { alunosIds, prazo });
  
  res.json({
    message: 'Exercício enviado com sucesso',
    data: {
      exercicioId: parseInt(id),
      alunosIds: alunosIds || [],
      prazo,
      dataEnvio: new Date().toISOString(),
      status: 'enviado'
    }
  });
});

// Ver exercício específico
router.get('/exercicios/:id/detalhes', (req: AuthRequest, res) => {
  const { id } = req.params;
  
  console.log('=== VER EXERCÍCIO ===');
  console.log('Exercício ID:', id);
  
  res.json({
    message: 'Detalhes do exercício',
    data: {
      id: parseInt(id),
      titulo: 'Equações do 2º grau',
      descricao: 'Resolva as equações propostas e justifique sua resposta',
      materia: 'Matemática',
      prazo: '2024-01-25',
      status: 'enviado',
      alunos: [
        {
          id: 1,
          nome: 'João Silva',
          status: 'pendente',
          dataEnvio: null
        },
        {
          id: 2,
          nome: 'Maria Santos',
          status: 'entregue',
          dataEnvio: '2024-01-20',
          nota: 8.5
        }
      ],
      questoes: [
        {
          numero: 1,
          enunciado: 'Resolva: x² - 5x + 6 = 0',
          tipo: 'calculo'
        }
      ]
    }
  });
});

// === ROTAS PARA AGENDA E AULAS ===
// Listar todas as aulas (para agenda)
router.get('/agenda/aulas', (req: AuthRequest, res) => {
  console.log('=== BUSCAR AULAS PARA AGENDA ===');
  
  res.json({
    message: 'Aulas da agenda',
    data: [
      {
        id: 1,
        data: '2024-06-04',
        horario: '14:00',
        aluno: 'João Silva',
        materia: 'Matemática',
        status: 'agendada',
        tipo: 'presencial'
      },
      {
        id: 2,
        data: '2024-06-04',
        horario: '16:00',
        aluno: 'Maria Santos',
        materia: 'Física',
        status: 'agendada',
        tipo: 'online'
      },
      {
        id: 3,
        data: '2024-06-05',
        horario: '15:00',
        aluno: 'Carlos Oliveira',
        materia: 'Química',
        status: 'agendada',
        tipo: 'presencial'
      }
    ]
  });
});

// Criar nova aula (para agenda)
router.post('/agenda/nova-aula', (req: AuthRequest, res) => {
  console.log('=== NOVA AULA (AGENDA) ===');
  console.log('Dados recebidos:', req.body);
  
  const { aluno, data, horario, materia, tipo, observacoes } = req.body;
  
  res.json({
    message: 'Nova aula criada com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 200,
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

export { router as professorRoutes }; 