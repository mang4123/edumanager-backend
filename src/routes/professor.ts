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
router.get('/alunos/:id', (req: AuthRequest, res) => {
  const { id } = req.params;
  
  res.json({
    message: 'Detalhes do aluno',
    data: {
      id: parseInt(id),
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      idade: 16,
      serie: '1º ano',
      materias: ['Matemática', 'Física'],
      notaMedia: 8.5,
      ultimaAula: '2024-01-15',
      proximaAula: '2024-01-22',
      situacao: 'em dia',
      observacoes: 'Aluno dedicado, precisa melhorar em física.'
    }
  });
});

// === SISTEMA DE CONVITE POR LINK EXCLUSIVO ===
// Gerar link de convite para aluno - FUNCIONAL E MELHORADO
router.post('/alunos/convite', (req: any, res) => {
  const { nome, email, telefone } = req.body;
  const professorId = req.user?.id;
  
  console.log('=== GERAR CONVITE - DADOS RECEBIDOS ===');
  console.log('Nome:', nome);
  console.log('Email:', email);
  console.log('Telefone:', telefone);
  console.log('Professor ID:', professorId);
  
  if (!nome || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nome e email são obrigatórios para gerar o convite',
      error: 'DADOS_INCOMPLETOS'
    });
  }
  
  try {
    // Gerar token único para o convite
    const conviteToken = Buffer.from(`${professorId}-${email}-${Date.now()}`).toString('base64');
    const linkConvite = `https://preview--tutor-class-organize.lovable.app/aluno/cadastro?convite=${conviteToken}&professor=${professorId}`;
    
    // Criar o convite no estado global
    const convite = {
      id: conviteToken,
      professorId: professorId || 'professor-default',
      nomeAluno: nome,
      emailAluno: email,
      telefoneAluno: telefone || '',
      token: conviteToken,
      linkConvite,
      dataGeracao: new Date().toISOString(),
      validoAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      usado: false
    };
    
    req.estadoGlobal.convitesGerados.push(convite);
    
    // Enviar email de convite (simulado)
    req.estadoGlobal.enviarNotificacaoEmail(
      email,
      'Convite para ser aluno - EduManager',
      `Olá ${nome}! Você foi convidado(a) para ser aluno. Clique no link para se cadastrar: ${linkConvite}`
    );
    
    // Enviar SMS se telefone fornecido (simulado)
    if (telefone) {
      req.estadoGlobal.enviarNotificacaoSMS(
        telefone,
        `Convite EduManager: Você foi convidado(a) para ser aluno. Link: ${linkConvite}`
      );
    }
    
    console.log('✅ CONVITE GERADO COM SUCESSO');
    console.log('Token:', conviteToken);
    console.log('Link:', linkConvite);
    
    return res.status(201).json({
      success: true,
      message: 'Convite gerado e enviado com sucesso!',
      data: {
        convite: {
          id: conviteToken,
          token: conviteToken,
          linkConvite,
          nomeAluno: nome,
          emailAluno: email,
          telefoneAluno: telefone,
          professorId: professorId,
          validoAte: convite.validoAte,
          dataGeracao: convite.dataGeracao,
          usado: false
        },
        envio: {
          email: true,
          sms: !!telefone,
          statusEmail: 'enviado',
          statusSms: telefone ? 'enviado' : 'nao_solicitado'
        },
        instrucoes: {
          comoUsar: 'O convite foi enviado por email/SMS. O aluno pode usar o link para se cadastrar automaticamente.',
          validadeDias: 7,
          linkDireto: linkConvite
        },
        estatisticas: {
          totalConvitesGerados: req.estadoGlobal.convitesGerados.length,
          convitesAtivos: req.estadoGlobal.convitesGerados.filter((c: any) => !c.usado && new Date(c.validoAte) > new Date()).length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ ERRO ao gerar convite:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao gerar convite',
      error: 'ERRO_INTERNO'
    });
  }
});

// Listar convites gerados pelo professor
router.get('/convites', (req: any, res) => {
  const professorId = req.user?.id;
  
  // Filtrar convites do professor atual
  const convitesProfessor = req.estadoGlobal.convitesGerados.filter(
    (convite: any) => convite.professorId === professorId
  );
  
  return res.json({
    message: 'Convites gerados',
    data: {
      convites: convitesProfessor,
      estatisticas: {
        total: convitesProfessor.length,
        usados: convitesProfessor.filter((c: any) => c.usado).length,
        ativos: convitesProfessor.filter((c: any) => !c.usado && new Date(c.validoAte) > new Date()).length,
        expirados: convitesProfessor.filter((c: any) => !c.usado && new Date(c.validoAte) <= new Date()).length
      }
    }
  });
});

// Validar convite
router.get('/convites/:token/validar', (req: AuthRequest, res) => {
  const { token } = req.params;
  
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

// Configurações - FUNCIONAIS
router.get('/config', (req: any, res) => {
  const professorId = req.user?.id;
  
  return res.json({
    message: 'Configurações do professor',
    data: {
      notificacoes: {
        email: true,
        sms: true,
        push: true,
        lembreteAula: true,
        novasInscricoes: true,
        pagamentosRecebidos: true,
        duvidasAlunos: true,
        exerciciosEntregues: true
      },
      privacidade: {
        perfilPublico: false,
        mostrarTelefone: true,
        aceitarNovoAlunos: true
      },
      ensino: {
        valorHoraAula: 50.00,
        duracaoAulaPadrao: 60,
        intervaloCancelamento: 24,
        materiasEnsina: ['Matemática', 'Física']
      },
      horarioDisponivel: {
        inicio: '08:00',
        fim: '18:00'
      },
      contato: {
        email: 'prof.testando@email.com',
        telefone: '+55 11 99999-9999'
      }
    }
  });
});

router.post('/config', (req: any, res) => {
  const professorId = req.user?.id;
  const configuracoes = req.body;
  
  // Teste das notificações se solicitado
  if (configuracoes.testarNotificacoes) {
    if (configuracoes.notificacoes?.email) {
      req.estadoGlobal.enviarNotificacaoEmail(
        configuracoes.contato?.email || 'prof.testando@email.com',
        'Teste de Notificação - EduManager',
        'Este é um teste das suas configurações de notificação por email. Tudo funcionando perfeitamente!'
      );
    }
    
    if (configuracoes.notificacoes?.sms && configuracoes.contato?.telefone) {
      req.estadoGlobal.enviarNotificacaoSMS(
        configuracoes.contato.telefone,
        'EduManager: Teste de SMS funcionando! Suas notificações estão configuradas corretamente.'
      );
    }
  }
  
  return res.json({
    message: 'Configurações atualizadas com sucesso',
    data: {
      configuracoes: configuracoes,
      testeRealizados: {
        email: !!configuracoes.notificacoes?.email,
        sms: !!(configuracoes.notificacoes?.sms && configuracoes.contato?.telefone)
      },
      proximasNotificacoes: [
        'Novas dúvidas de alunos',
        'Exercícios entregues',
        'Lembretes de aulas',
        'Pagamentos recebidos'
      ],
      dataAtualizacao: new Date().toISOString()
    }
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

// Listar dúvidas dos alunos - BIDIRECIONAL
router.get('/duvidas', (req: any, res) => {
  const professorId = req.user?.id;
  
  // Filtrar dúvidas direcionadas a este professor
  const duvidasProfessor = req.estadoGlobal.duvidasSistema.filter(
    (duvida: any) => duvida.professorId === professorId
  );
  
  // Adicionar as dúvidas padrão se não houver dúvidas específicas
  if (duvidasProfessor.length === 0) {
    duvidasProfessor.push(...duvidasMemoria);
  }
  
  res.json({
    message: 'Dúvidas dos alunos',
    data: duvidasProfessor.map((duvida: any) => ({
      id: duvida.id,
      aluno: {
        id: duvida.alunoId || duvida.aluno?.id,
        nome: duvida.alunoId === '725be6a4-addf-4e19-b866-496093537918' ? 'Aluno Teste' : (duvida.aluno?.nome || 'Ana Silva'),
        foto: duvida.aluno?.foto || '/api/placeholder/32/32'
      },
      pergunta: duvida.pergunta,
      materia: duvida.materia,
      data: duvida.data,
      status: duvida.status,
      urgencia: duvida.urgencia,
      resposta: duvida.resposta,
      dataResposta: duvida.dataResposta
    }))
  });
});

// Responder uma dúvida específica - BIDIRECIONAL
router.post('/duvidas/:id/responder', (req: any, res) => {
  const { id } = req.params;
  const { resposta } = req.body;
  const professorId = req.user?.id;
  
  // Encontrar e atualizar a dúvida no sistema global
  const duvidaIndex = req.estadoGlobal.duvidasSistema.findIndex((d: any) => d.id === parseInt(id));
  
  if (duvidaIndex !== -1) {
    req.estadoGlobal.duvidasSistema[duvidaIndex] = {
      ...req.estadoGlobal.duvidasSistema[duvidaIndex],
      status: 'respondida',
      resposta,
      dataResposta: new Date().toISOString()
    };
    
    const duvidaAtualizada = req.estadoGlobal.duvidasSistema[duvidaIndex];
    
    // Criar notificação para o aluno que fez a pergunta
    req.estadoGlobal.criarNotificacao(
      duvidaAtualizada.alunoId,
      'resposta',
      'Sua dúvida foi respondida!',
      `O professor respondeu sua pergunta sobre ${duvidaAtualizada.materia}`,
      'normal',
      {
        tipo: 'modal',
        dados: {
          duvidaId: parseInt(id),
          pergunta: duvidaAtualizada.pergunta,
          resposta: resposta
        }
      }
    );
    
    // Enviar email para o aluno (simulado)
    req.estadoGlobal.enviarNotificacaoEmail(
      'aluno@email.com',
      'Sua dúvida foi respondida - EduManager',
      `Olá! O professor respondeu sua pergunta sobre ${duvidaAtualizada.materia}:\n\nPergunta: ${duvidaAtualizada.pergunta}\nResposta: ${resposta}`
    );
    
  } else {
    // Fallback para dúvidas locais
    const duvidaLocalIndex = duvidasMemoria.findIndex(d => d.id === parseInt(id));
    if (duvidaLocalIndex !== -1) {
      duvidasMemoria[duvidaLocalIndex] = {
        ...duvidasMemoria[duvidaLocalIndex],
        status: 'respondida',
        resposta,
        dataResposta: new Date().toISOString()
      };
    }
  }
  
  return res.json({
    message: 'Dúvida respondida com sucesso',
    data: {
      duvidaId: parseInt(id),
      resposta,
      dataResposta: new Date().toISOString(),
      status: 'respondida',
      notificacaoEnviada: true
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