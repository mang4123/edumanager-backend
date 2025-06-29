import { Router } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
router.use(requireRole(['professor']));

// Dashboard principal
router.get('/dashboard', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        // Buscar estatísticas do professor
        const { data: alunos } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('professor_id', userId)
            .eq('tipo', 'aluno');

        const { data: aulas } = await supabaseAdmin
            .from('aulas')
            .select('*')
            .eq('professor_id', userId);

        const { data: exercicios } = await supabaseAdmin
            .from('exercicios')
            .select('*')
            .eq('professor_id', userId);

        const { data: duvidas } = await supabaseAdmin
            .from('duvidas')
            .select('*')
            .eq('professor_id', userId)
            .eq('status', 'aberta');

        // Próximas aulas (hoje)
        const hoje = new Date().toISOString().split('T')[0];
        const { data: proximasAulas } = await supabaseAdmin
            .from('aulas')
            .select(`
                *,
                aluno:profiles!aulas_aluno_id_fkey(nome, email)
            `)
            .eq('professor_id', userId)
            .gte('data_hora', hoje)
            .lte('data_hora', hoje + 'T23:59:59')
            .order('data_hora', { ascending: true });

        // Estatísticas financeiras
        const { data: financeiro } = await supabaseAdmin
            .from('financeiro')
            .select('*')
            .eq('professor_id', userId);

        const receitaTotal = financeiro?.reduce((total, item) => 
            item.status === 'pago' ? total + parseFloat(item.valor) : total, 0) || 0;
        
        const pendentes = financeiro?.filter(item => item.status === 'pendente').length || 0;

        res.json({
            success: true,
            data: {
                estatisticas: {
                    totalAlunos: alunos?.length || 0,
                    totalAulas: aulas?.length || 0,
                    totalExercicios: exercicios?.length || 0,
                    duvidasPendentes: duvidas?.length || 0,
                    receitaTotal,
                    pagamentosPendentes: pendentes
                },
                proximasAulas: proximasAulas || [],
                duvidasPendentes: duvidas?.slice(0, 5) || []
            }
        });
    } catch (error) {
        console.error('Erro no dashboard:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// Perfil do professor
router.get('/profile', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        
        const { data: professor, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .eq('tipo', 'professor')
            .single();

        if (error || !professor) {
            return res.status(404).json({ 
                success: false, 
                error: 'Professor não encontrado' 
            });
        }

        return res.json({
            success: true,
            data: professor
        });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// Atualizar perfil
router.put('/profile', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { nome, telefone, especialidade } = req.body;

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ 
                nome, 
                telefone, 
                especialidade,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .eq('tipo', 'professor')
            .select()
            .single();

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Erro ao atualizar perfil' 
            });
        }

        return res.json({
            success: true,
            data,
            message: 'Perfil atualizado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// Listar alunos
router.get('/alunos', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        
        const { data: alunos, error } = await supabaseAdmin
            .from('profiles')
            .select(`
                id,
                nome,
                email,
                telefone,
                created_at,
                updated_at
            `)
            .eq('professor_id', userId)
            .eq('tipo', 'aluno')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Erro ao buscar alunos' 
            });
        }

        return res.json({
            success: true,
            data: alunos || []
        });
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// Alias para alunos (compatibilidade)
router.get('/students', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        
        const { data: alunos, error } = await supabaseAdmin
            .from('profiles')
            .select(`
                id,
                nome,
                email,
                telefone,
                created_at,
                updated_at
            `)
            .eq('professor_id', userId)
            .eq('tipo', 'aluno')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Erro ao buscar alunos' 
            });
        }

        return res.json({
            success: true,
            data: alunos || []
        });
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// Detalhes de um aluno específico
router.get('/alunos/:id', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const alunoId = req.params.id;

        const { data: aluno, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', alunoId)
            .eq('professor_id', userId)
            .eq('tipo', 'aluno')
            .single();

        if (error || !aluno) {
            return res.status(404).json({ 
                success: false, 
                error: 'Aluno não encontrado' 
            });
        }

        // Buscar dados adicionais do aluno
        const { data: aulas } = await supabaseAdmin
            .from('aulas')
            .select('*')
            .eq('aluno_id', alunoId)
            .eq('professor_id', userId);

        const { data: exercicios } = await supabaseAdmin
            .from('exercicio_alunos')
            .select(`
                *,
                exercicio:exercicios(titulo, materia)
            `)
            .eq('aluno_id', alunoId);

        const { data: financeiro } = await supabaseAdmin
            .from('financeiro')
            .select('*')
            .eq('aluno_id', alunoId)
            .eq('professor_id', userId);

        return res.json({
            success: true,
            data: {
                ...aluno,
                estatisticas: {
                    totalAulas: aulas?.length || 0,
                    totalExercicios: exercicios?.length || 0,
                    exerciciosPendentes: exercicios?.filter(e => e.status === 'pendente').length || 0,
                    pagamentosPendentes: financeiro?.filter(f => f.status === 'pendente').length || 0
                },
                aulas: aulas || [],
                exercicios: exercicios || [],
                financeiro: financeiro || []
            }
        });
    } catch (error) {
        console.error('Erro ao buscar detalhes do aluno:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// Gerar token de convite para aluno
router.post('/alunos/gerar-token', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        
        // Gerar token simples de 6 caracteres
        const token = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Salvar o token temporariamente (você pode criar uma tabela específica para isso)
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ convite_token: token })
            .eq('id', userId)
            .eq('tipo', 'professor')
            .select()
            .single();

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Erro ao gerar token' 
            });
        }

        return res.json({
            success: true,
            data: { token },
            message: `Token gerado: ${token}. Compartilhe com seu aluno.`
        });
    } catch (error) {
        console.error('Erro ao gerar token:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// Remover aluno
router.delete('/alunos/:id', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const alunoId = req.params.id;

        const { error } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', alunoId)
            .eq('professor_id', userId)
            .eq('tipo', 'aluno');

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Erro ao remover aluno' 
            });
        }

        return res.json({
            success: true,
            message: 'Aluno removido com sucesso'
        });
    } catch (error) {
        console.error('Erro ao remover aluno:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// === SISTEMA DE TOKEN SIMPLES PARA CONVITES ===
// (Removido rota duplicada - usando a implementação acima)

// Validar token simples
router.get('/tokens/:token/validar', (req: any, res) => {
  const { token } = req.params;
  
  console.log('=== VALIDAR TOKEN ===');
  console.log('Token:', token);
  
  try {
    // Buscar token no estado global
    const convite = req.estadoGlobal?.convitesGerados?.find(
      (c: any) => c.token === token.toUpperCase()
    );
    
    if (!convite) {
      return res.status(404).json({
        valido: false,
        motivo: 'Token não encontrado no sistema'
      });
    }
    
    // Verificar se não expirou
    const agora = new Date();
    const validoAte = new Date(convite.validoAte);
    
    if (agora > validoAte) {
      return res.status(400).json({
        valido: false,
        motivo: 'Token expirado',
        dataExpiracao: convite.validoAte
      });
    }
    
    // Verificar se já foi usado
    if (convite.usado) {
      return res.status(400).json({
        valido: false,
        motivo: 'Este token já foi utilizado'
      });
    }
    
    console.log('✅ Token válido:', token);
    
    return res.json({
      valido: true,
      dadosAluno: {
        nome: convite.nomeAluno,
        email: convite.emailAluno,
        telefone: convite.telefoneAluno
      },
      professor: {
        id: convite.professorId
      },
      dataGeracao: convite.dataGeracao,
      validoAte: convite.validoAte,
      diasRestantes: Math.ceil((validoAte.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
    });
    
  } catch (error) {
    console.error('❌ ERRO ao validar token:', error);
    return res.status(500).json({
      valido: false,
      motivo: 'Erro interno do servidor'
    });
  }
});

// Listar tokens gerados pelo professor
router.get('/tokens', (req: any, res) => {
  const professorId = req.user?.id;
  
  // Filtrar tokens do professor atual
  const tokensProfessor = req.estadoGlobal.convitesGerados.filter(
    (convite: any) => convite.professorId === professorId
  );
  
  return res.json({
    message: 'Tokens gerados',
    data: {
      tokens: tokensProfessor.map((c: any) => ({
        token: c.token,
        aluno: {
          nome: c.nomeAluno,
          email: c.emailAluno,
          telefone: c.telefoneAluno
        },
        status: c.usado ? 'usado' : (new Date(c.validoAte) > new Date() ? 'ativo' : 'expirado'),
        dataGeracao: c.dataGeracao,
        validoAte: c.validoAte,
        usado: c.usado
      })),
      estatisticas: {
        total: tokensProfessor.length,
        usados: tokensProfessor.filter((c: any) => c.usado).length,
        ativos: tokensProfessor.filter((c: any) => !c.usado && new Date(c.validoAte) > new Date()).length,
        expirados: tokensProfessor.filter((c: any) => !c.usado && new Date(c.validoAte) <= new Date()).length
      }
    }
  });
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

// Responder uma dúvida específica - BIDIRECIONAL - CORRIGIDO
router.post('/duvidas/:id/responder', (req: any, res) => {
  const { id } = req.params;
  const { resposta } = req.body;
  const professorId = req.user?.id;
  
  console.log('=== RESPONDER DÚVIDA (BIDIRECIONAL) ===');
  console.log('Dúvida ID:', id);
  console.log('Professor ID:', professorId);
  console.log('Resposta:', resposta);
  
  // Encontrar e atualizar a dúvida no sistema global - CORRIGIDO para comparar com string
  const duvidaIndex = req.estadoGlobal.duvidasSistema.findIndex((d: any) => d.id.toString() === id.toString());
  
  if (duvidaIndex !== -1) {
    console.log('✅ Dúvida encontrada no sistema global');
    
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
          duvidaId: id,
          pergunta: duvidaAtualizada.pergunta,
          resposta: resposta
        }
      }
    );
    
    // Enviar email para o aluno (simulado)
    req.estadoGlobal.enviarNotificacaoEmail(
      duvidaAtualizada.alunoId.includes('@') ? duvidaAtualizada.alunoId : 'aluno@email.com',
      'Sua dúvida foi respondida - EduManager',
      `Olá! O professor respondeu sua pergunta sobre ${duvidaAtualizada.materia}:\n\nPergunta: ${duvidaAtualizada.pergunta}\nResposta: ${resposta}`
    );
    
    console.log('✅ Dúvida respondida com sucesso');
    
    return res.json({
      message: 'Dúvida respondida com sucesso',
      data: {
        duvidaId: id,
        resposta,
        dataResposta: new Date().toISOString(),
        status: 'respondida',
        notificacaoEnviada: true,
        duvidaAtualizada
      }
    });
    
  } else {
    console.log('❌ Dúvida não encontrada no sistema global, tentando dúvidas locais');
    
    // Fallback para dúvidas locais - CORRIGIDO
    const duvidaLocalIndex = duvidasMemoria.findIndex(d => d.id.toString() === id.toString());
    if (duvidaLocalIndex !== -1) {
      console.log('✅ Dúvida encontrada nas dúvidas locais');
      
      duvidasMemoria[duvidaLocalIndex] = {
        ...duvidasMemoria[duvidaLocalIndex],
        status: 'respondida',
        resposta,
        dataResposta: new Date().toISOString()
      };
      
      return res.json({
        message: 'Dúvida respondida com sucesso',
        data: {
          duvidaId: id,
          resposta,
          dataResposta: new Date().toISOString(),
          status: 'respondida',
          notificacaoEnviada: false,
          fonte: 'local'
        }
      });
    } else {
      console.log('❌ Dúvida não encontrada em lugar nenhum');
      
      return res.status(404).json({
        message: 'Dúvida não encontrada',
        error: 'DUVIDA_NAO_ENCONTRADA',
        debug: {
          idProcurado: id,
          totalDuvidasSistema: req.estadoGlobal.duvidasSistema.length,
          totalDuvidasLocais: duvidasMemoria.length,
          duvidasSistemaIds: req.estadoGlobal.duvidasSistema.map((d: any) => d.id),
          duvidasLocaisIds: duvidasMemoria.map(d => d.id)
        }
      });
    }
  }
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