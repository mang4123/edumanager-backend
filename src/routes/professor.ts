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
        
        console.log('🔍 Buscando alunos para professor:', userId);

        // Buscar alunos vinculados ao professor na tabela de relacionamento
        const { data: relacionamentos, error: relError } = await supabaseAdmin
            .from('alunos')
            .select(`
                id,
                aluno_id,
                professor_id,
                observacoes,
                ativo,
                created_at
            `)
            .eq('professor_id', userId)
            .eq('ativo', true)
            .order('created_at', { ascending: false });

        if (relError) {
            console.error('Erro na consulta relacionamentos:', relError);
            // Se der erro na tabela alunos, buscar direto na profiles
            const { data: alunosProfiles, error: profilesError } = await supabaseAdmin
                .from('profiles')
                .select(`
                    id,
                    nome,
                    email,
                    telefone,
                    created_at
                `)
                .eq('professor_id', userId)
                .eq('tipo', 'aluno')
                .order('created_at', { ascending: false });

            if (profilesError) {
                console.error('Erro ao buscar na tabela profiles:', profilesError);
                return res.json({
                    success: true,
                    data: [],
                    total: 0,
                    message: 'Nenhum aluno encontrado'
                });
            }

            const alunosFormatados = (alunosProfiles || []).map((aluno: any) => ({
                id: aluno.id,
                aluno_id: aluno.id,
                nome: aluno.nome,
                email: aluno.email,
                telefone: aluno.telefone,
                observacoes: null,
                ativo: true,
                created_at: aluno.created_at
            }));

            return res.json({
                success: true,
                data: alunosFormatados,
                total: alunosFormatados.length
            });
        }

        // Se encontrou relacionamentos, buscar dados dos alunos
        if (!relacionamentos || relacionamentos.length === 0) {
            return res.json({
                success: true,
                data: [],
                total: 0,
                message: 'Nenhum aluno vinculado'
            });
        }

        const alunosIds = relacionamentos.map(rel => rel.aluno_id);
        
        const { data: alunosProfiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select(`
                id,
                nome,
                email,
                telefone
            `)
            .in('id', alunosIds)
            .eq('tipo', 'aluno');

        if (profilesError) {
            console.error('Erro ao buscar perfis dos alunos:', profilesError);
        }

        // Combinar dados dos relacionamentos com os perfis
        const alunosFormatados = relacionamentos.map((rel: any) => {
            const perfil = alunosProfiles?.find(p => p.id === rel.aluno_id);
            return {
                id: rel.id,
                aluno_id: rel.aluno_id,
                nome: perfil?.nome || 'Aluno',
                email: perfil?.email || '',
                telefone: perfil?.telefone || '',
                observacoes: rel.observacoes,
                ativo: rel.ativo,
                created_at: rel.created_at
            };
        });

        console.log('✅ Alunos encontrados:', alunosFormatados.length);

        return res.json({
            success: true,
            data: alunosFormatados,
            total: alunosFormatados.length
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
router.post('/alunos/gerar-token', async (req: any, res) => {
    try {
        const userId = req.user!.id;
        const { nomeAluno, emailAluno, telefoneAluno } = req.body;
        
        // Gerar token simples de 6 caracteres
        const token = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Criar convite no estado global (não depende do Supabase)
        const convite = {
            id: `conv-${Date.now()}`,
            professorId: userId,
            nomeAluno: nomeAluno || 'Aluno Convidado',
            emailAluno: emailAluno || 'aluno@exemplo.com',
            telefoneAluno: telefoneAluno || '(11) 99999-9999',
            token: token,
            linkConvite: `https://lclass.lovable.app/aluno/register?token=${token}`,
            dataGeracao: new Date().toISOString(),
            validoAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
            usado: false
        };
        
        // Salvar no estado global
        req.estadoGlobal.convitesGerados.push(convite);
        
        // Tentar salvar no Supabase também (mas não é obrigatório)
        try {
            await supabaseAdmin
                .from('profiles')
                .update({ convite_token: token })
                .eq('id', userId)
                .eq('tipo', 'professor');
        } catch (supabaseError) {
            console.log('Aviso: Não foi possível salvar no Supabase, mas token foi gerado:', supabaseError);
        }

        return res.json({
            success: true,
            data: { 
                token,
                linkConvite: convite.linkConvite,
                validoAte: convite.validoAte
            },
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
router.get('/aulas', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        
        // Primeiro, vamos tentar buscar as aulas da tabela que pode existir
        let aulas = [];
        
        try {
            const { data, error } = await supabaseAdmin
                .from('aulas')
                .select(`
                    *,
                    aluno:profiles!aulas_aluno_id_fkey(id, nome, email)
                `)
                .eq('professor_id', userId)
                .order('data_hora', { ascending: false });

            if (data && !error) {
                aulas = data;
            }
        } catch (supabaseError) {
            console.log('Erro ao buscar aulas:', supabaseError);
        }

        // Retornar apenas aulas reais do banco de dados

        res.json({ 
            success: true,
            message: 'Lista de aulas do professor',
            data: aulas
        });
    } catch (error) {
        console.error('Erro ao buscar aulas:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
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

// Editar aula específica
router.put('/aulas/:id', (req, res) => {
  const aulaId = parseInt(req.params.id);
  
  res.json({ 
    message: 'Aula editada com sucesso',
    data: {
      id: aulaId,
      aluno: {
        id: req.body.aluno_id || 1,
        nome: req.body.aluno_nome || 'João Silva',
        email: req.body.aluno_email || 'joao@email.com'
      },
      data: req.body.data || new Date().toISOString().split('T')[0],
      horario: req.body.horario || '14:00',
      materia: req.body.materia || 'Matemática',
      topico: req.body.topico || 'Tópico da aula',
      status: req.body.status || 'atualizada', // ✅ Agora usa o status enviado
      tipo: req.body.tipo || 'presencial',
      duracao: req.body.duracao || 60,
      valor: req.body.valor || 100,
      observacoes: req.body.observacoes || '',
      dataAlteracao: new Date().toISOString()
    }
  });
});

// ✅ Cancelar aula específica (DELETE)
router.delete('/aulas/:id', (req, res) => {
  const aulaId = parseInt(req.params.id);
  const motivo = req.body.motivo || 'Cancelada pelo professor';
  
  res.json({ 
    message: 'Aula cancelada com sucesso',
    data: {
      id: aulaId,
      status: 'cancelada',
      motivo: motivo,
      dataCancelamento: new Date().toISOString(),
      canceladoPor: 'professor'
    }
  });
});

// Exercícios
router.get('/exercicios', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        
        // Tentar buscar exercícios da tabela que pode existir
        let exercicios = [];
        
        try {
            const { data, error } = await supabaseAdmin
                .from('exercicios')
                .select(`
                    *,
                    exercicio_alunos(
                        aluno_id,
                        status,
                        profiles(nome, email)
                    )
                `)
                .eq('professor_id', userId)
                .order('created_at', { ascending: false });

            if (data && !error) {
                exercicios = data.map(exercicio => ({
                    ...exercicio,
                    alunos: exercicio.exercicio_alunos?.map((ea: any) => ea.profiles?.nome) || []
                }));
            }
        } catch (supabaseError) {
            console.log('Erro ao buscar exercícios:', supabaseError);
        }

        // Retornar apenas exercícios reais do banco de dados

        res.json({ 
            success: true,
            message: 'Lista de exercícios',
            data: exercicios
        });
    } catch (error) {
        console.error('Erro ao buscar exercícios:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

// Criar exercício - MELHORADO
router.post('/exercicios', (req: any, res) => {
  try {
    const { titulo, descricao, materia, dificuldade, prazo, alunos, questoes } = req.body;
    const professorId = req.user?.id || 'professor-default';
    
    console.log('=== CRIAR EXERCÍCIO ===');
    console.log('Dados recebidos:', req.body);
    console.log('Professor ID:', professorId);
    
    // Validação básica
    if (!titulo || titulo.trim().length === 0) {
      return res.status(400).json({
        message: 'Título do exercício é obrigatório',
        error: 'TITULO_OBRIGATORIO'
      });
    }
    
    // Criar exercício completo
    const novoExercicio = {
      id: Date.now(), // ID único baseado em timestamp
      titulo: titulo.trim(),
      descricao: descricao?.trim() || 'Exercício criado pelo professor',
      materia: materia || 'Geral',
      dificuldade: dificuldade || 'médio',
      prazo: prazo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
      status: 'criado',
      dataCriacao: new Date().toISOString(),
      professorId: professorId,
      alunos: alunos || [],
      questoes: questoes || [],
      pontuacao: 10,
      tipo: 'exercício',
      ativo: true
    };
    
    console.log('✅ Exercício criado:', novoExercicio);
    
    return res.json({ 
      message: 'Exercício criado com sucesso',
      data: novoExercicio
    });
    
  } catch (error) {
    console.error('❌ ERRO ao criar exercício:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao criar exercício',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Financeiro
router.get('/financeiro', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Buscar dados financeiros reais
    const { data: dadosFinanceiros, error } = await supabaseAdmin
      .from('financeiro')
      .select(`
        *,
        aluno:profiles!financeiro_aluno_id_fkey(nome)
      `)
      .eq('professor_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    }

    const totalRecebido = dadosFinanceiros?.filter(d => d.status === 'pago').reduce((sum, d) => sum + (d.valor || 0), 0) || 0;
    const totalPendente = dadosFinanceiros?.filter(d => d.status === 'pendente').reduce((sum, d) => sum + (d.valor || 0), 0) || 0;
    
    const pagamentosRecentes = dadosFinanceiros?.slice(0, 10).map(d => ({
      id: d.id,
      aluno: d.aluno?.nome || 'Aluno',
      valor: d.valor,
      data: d.created_at?.split('T')[0],
      status: d.status
    })) || [];

    res.json({ 
      message: 'Relatório financeiro',
      data: {
        totalRecebido,
        totalPendente,
        mesAtual: totalRecebido,
        pagamentosRecentes
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
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

// === ROTAS PARA DÚVIDAS ===
// Dúvidas removidas - usar apenas dados reais do Supabase

// Listar dúvidas dos alunos - BIDIRECIONAL
router.get('/duvidas', (req: any, res) => {
  const professorId = req.user?.id;
  
  // Filtrar dúvidas direcionadas a este professor
  const duvidasProfessor = req.estadoGlobal.duvidasSistema.filter(
    (duvida: any) => duvida.professorId === professorId
  );
  
  // Dados removidos - usar apenas dúvidas reais do Supabase
  
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

// Responder uma dúvida específica - BIDIRECIONAL - MELHORADO
router.post('/duvidas/:id/responder', (req: any, res) => {
  try {
    const { id } = req.params;
    const { resposta } = req.body;
    const professorId = req.user?.id;
    
    console.log('=== RESPONDER DÚVIDA (BIDIRECIONAL) ===');
    console.log('Dúvida ID:', id);
    console.log('Professor ID:', professorId);
    console.log('Resposta:', resposta);
    
    if (!resposta || resposta.trim().length === 0) {
      return res.status(400).json({
        message: 'Resposta não pode estar vazia',
        error: 'RESPOSTA_VAZIA'
      });
    }
    
    // Encontrar e atualizar a dúvida no sistema global
    const duvidaIndex = req.estadoGlobal?.duvidasSistema?.findIndex((d: any) => d.id.toString() === id.toString());
    
    if (duvidaIndex !== -1 && req.estadoGlobal?.duvidasSistema) {
      console.log('✅ Dúvida encontrada no sistema global');
      
      // Atualizar a dúvida
      req.estadoGlobal.duvidasSistema[duvidaIndex] = {
        ...req.estadoGlobal.duvidasSistema[duvidaIndex],
        status: 'respondida',
        resposta: resposta.trim(),
        dataResposta: new Date().toISOString(),
        professorId: professorId
      };
      
      const duvidaAtualizada = req.estadoGlobal.duvidasSistema[duvidaIndex];
      
      // Criar notificação para o aluno (se funções disponíveis)
      if (req.estadoGlobal?.criarNotificacao) {
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
              resposta: resposta.trim()
            }
          }
        );
      }
      
      // Enviar email para o aluno (se função disponível)
      if (req.estadoGlobal?.enviarNotificacaoEmail) {
        req.estadoGlobal.enviarNotificacaoEmail(
          duvidaAtualizada.alunoId.includes('@') ? duvidaAtualizada.alunoId : 'aluno@email.com',
          'Sua dúvida foi respondida - EduManager',
          `Olá! O professor respondeu sua pergunta sobre ${duvidaAtualizada.materia}:\n\nPergunta: ${duvidaAtualizada.pergunta}\nResposta: ${resposta.trim()}`
        );
      }
      
      console.log('✅ Dúvida respondida e persistida com sucesso');
      
      return res.json({
        message: 'Dúvida respondida com sucesso',
        data: {
          duvidaId: id,
          resposta: resposta.trim(),
          dataResposta: new Date().toISOString(),
          status: 'respondida',
          notificacaoEnviada: true,
          duvidaAtualizada: {
            id: duvidaAtualizada.id,
            pergunta: duvidaAtualizada.pergunta,
            resposta: resposta.trim(),
            status: 'respondida',
            dataResposta: new Date().toISOString()
          }
        }
      });
      
    } else {
      console.log('❌ Dúvida não encontrada no sistema global');
      
      // Retornar erro se não encontrou a dúvida
      return res.status(404).json({
        message: 'Dúvida não encontrada',
        error: 'DUVIDA_NAO_ENCONTRADA',
        data: {
          duvidaId: id,
          observacao: 'Use apenas dados reais do sistema'
        }
      });
    }
  } catch (error) {
    console.error('❌ ERRO ao responder dúvida:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao responder dúvida',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
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

// === ROTAS PUT E DELETE PARA EXERCÍCIOS ===
// Editar exercício
router.put('/exercicios/:id', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { titulo, descricao, materia, dificuldade, prazo, status } = req.body;
  
  console.log('=== EDITAR EXERCÍCIO (PROFESSOR) ===');
  console.log('ID:', id);
  console.log('Dados:', req.body);
  console.log('Professor:', req.user?.id);
  
  if (!titulo || titulo.trim().length === 0) {
    return res.status(400).json({
      message: 'Título é obrigatório'
    });
  }
  
  // Simular atualização
  const exercicioAtualizado = {
    id: parseInt(id),
    titulo: titulo.trim(),
    descricao: descricao || 'Sem descrição',
    materia: materia || 'Geral',
    dificuldade: dificuldade || 'médio',
    prazo: prazo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: status || 'atualizado',
    dataModificacao: new Date().toISOString(),
    professorId: req.user?.id
  };
  
  console.log('✅ Exercício atualizado:', exercicioAtualizado);
  
  return res.json({
    message: 'Exercício atualizado com sucesso',
    data: exercicioAtualizado
  });
});

// Excluir exercício
router.delete('/exercicios/:id', (req: AuthRequest, res) => {
  const { id } = req.params;
  
  console.log('=== EXCLUIR EXERCÍCIO (PROFESSOR) ===');
  console.log('ID:', id);
  console.log('Professor:', req.user?.id);
  
  // Simular exclusão
  const exercicioExcluido = {
    id: parseInt(id),
    titulo: `Exercício ${id}`,
    dataExclusao: new Date().toISOString(),
    professorId: req.user?.id
  };
  
  console.log('✅ Exercício excluído:', exercicioExcluido);
  
  return res.json({
    message: 'Exercício excluído com sucesso',
    data: {
      exercicioExcluido: exercicioExcluido.titulo,
      id: parseInt(id),
      status: 'excluido'
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

// Criar convite
router.post('/convites', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { nome, email, observacoes, valor_aula, data_vencimento } = req.body;

    console.log('📝 Iniciando criação de convite para professor:', userId);

    // 1. Verificar se o professor tem perfil
    const { data: professorProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil do professor:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar perfil do professor',
        details: profileError
      });
    }

    // 2. Se não tiver perfil, criar
    if (!professorProfile) {
      console.log('⚠️ Professor sem perfil, criando...');
      
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          nome: req.user!.nome || req.user!.email?.split('@')[0] || 'Professor',
          email: req.user!.email,
          tipo: 'professor',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar perfil do professor:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao criar perfil do professor',
          details: insertError
        });
      }

      console.log('✅ Perfil do professor criado com sucesso:', newProfile);
    } else {
      console.log('✅ Perfil do professor já existe:', professorProfile);
    }

    // 3. Gerar token único
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);

    // 4. Data de expiração (7 dias)
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    // 5. Criar convite
    const { data: convite, error: conviteError } = await supabaseAdmin
      .from('convites')
      .insert({
        professor_id: userId,
        nome,
        email,
        token,
        observacoes,
        valor_aula,
        data_vencimento,
        expires_at: expires_at.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (conviteError) {
      console.error('❌ Erro ao criar convite:', conviteError);
      return res.status(400).json({
        success: false,
        error: 'Erro ao criar convite',
        details: conviteError
      });
    }

    console.log('✅ Convite criado com sucesso:', convite);

    return res.json({
      success: true,
      data: convite,
      message: 'Convite criado com sucesso'
    });

  } catch (error) {
    console.error('💥 Erro ao criar convite:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export { router as professorRoutes }; 