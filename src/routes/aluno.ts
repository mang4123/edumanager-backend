import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Aplicar autenticação em todas as rotas (sem restrição de role)
router.use(authenticateToken);

// ==========================================
// ROTAS ALUNO - DADOS REAIS DO BANCO
// ==========================================

// GET /api/aluno/profile - Perfil do aluno
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    console.log('=== PERFIL DO ALUNO (DADOS REAIS) ===');
    
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('👤 [ALUNO] Buscando perfil para:', user.id, user.email);

    // 🔥 PRIMEIRO: VERIFICAR SE HÁ CONVITES PENDENTES PARA ESTE USUÁRIO
    console.log('🔍 [ALUNO] Verificando convites pendentes para:', user.email);
    
    // 🧪 TESTE: Criar convite temporário se não existir (APENAS PARA NATALIA)
    if (user.email === 'nataliapereira@gmail.com') {
      console.log('🧪 [TESTE] Verificando/criando convite para Natalia...');
      
      try {
        // Verificar se já existe professor de teste
        let { data: professorTeste, error: profError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', 'professor@teste.com')
          .single();
        
        if (!professorTeste) {
          console.log('🔨 [TESTE] Criando professor de teste...');
          const { data: novoProfessor, error: errorCriarProf } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: 'prof-teste-' + Date.now(),
              email: 'professor@teste.com',
              nome: 'Professor Teste',
              tipo: 'professor',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (!errorCriarProf) {
            professorTeste = novoProfessor;
            console.log('✅ [TESTE] Professor de teste criado:', professorTeste.id);
          }
        }
        
        if (professorTeste) {
          // Criar convite de teste
          console.log('🔨 [TESTE] Criando convite de teste...');
          await supabaseAdmin
            .from('convites')
            .insert({
              professor_id: professorTeste.id,
              nome_aluno: 'Natalia Pereira',
              email_aluno: 'nataliapereira@gmail.com',
              telefone_aluno: '19993327886',
              token: 'teste-natalia-' + Date.now(),
              usado: false,
              created_at: new Date().toISOString()
            });
          console.log('✅ [TESTE] Convite de teste criado!');
        }
      } catch (testeError) {
        console.log('⚠️ [TESTE] Erro ao criar dados de teste:', testeError);
      }
    }
    
    const { data: convitesPendentes, error: convitesError } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('email_aluno', user.email)
      .eq('usado', false)
      .order('created_at', { ascending: false});

    if (convitesPendentes && convitesPendentes.length > 0) {
      const convite = convitesPendentes[0]; // Pegar o convite mais recente
      console.log('🎯 [ALUNO] CONVITE PENDENTE ENCONTRADO! Vinculando automaticamente...', convite);
      
      try {
        // 1. Verificar se já existe perfil na tabela profiles
        const { data: perfilExistente } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // 2. Criar/atualizar perfil como aluno
        const perfilAluno = {
          id: user.id,
          email: user.email,
          nome: user.nome || convite.nome_aluno || 'Aluno',
          telefone: user.telefone || convite.telefone_aluno || null,
          tipo: 'aluno', // FORÇA COMO ALUNO
          professor_id: convite.professor_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (perfilExistente) {
          // Atualizar perfil existente
          await supabaseAdmin
            .from('profiles')
            .update({
              tipo: 'aluno',
              professor_id: convite.professor_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          console.log('✅ [ALUNO] Perfil atualizado para aluno');
        } else {
          // Criar novo perfil
          await supabaseAdmin
            .from('profiles')
            .insert(perfilAluno);
          console.log('✅ [ALUNO] Novo perfil criado como aluno');
        }

        // 3. Criar relacionamento na tabela alunos
        const { data: alunoExistente } = await supabaseAdmin
          .from('alunos')
          .select('*')
          .eq('aluno_id', user.id)
          .single();

        if (!alunoExistente) {
          await supabaseAdmin
            .from('alunos')
            .insert({
              aluno_id: user.id,
              professor_id: convite.professor_id,
              ativo: true,
              created_at: new Date().toISOString()
            });
          console.log('✅ [ALUNO] Relacionamento aluno-professor criado');
        }

        // 4. Marcar convite como usado
        await supabaseAdmin
          .from('convites')
          .update({ 
            usado: true, 
            usado_em: new Date().toISOString() 
          })
          .eq('id', convite.id);
        console.log('✅ [ALUNO] Convite marcado como usado');

        console.log('🎉 [ALUNO] VINCULAÇÃO AUTOMÁTICA CONCLUÍDA!');
        
      } catch (vinculacaoError) {
        console.error('💥 [ALUNO] Erro na vinculação automática:', vinculacaoError);
      }
    }

    // Buscar dados reais do aluno - Query SIMPLIFICADA
    const { data: alunoData, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select(`
        id,
        professor_id,
        ativo,
        aluno_id
      `)
      .eq('aluno_id', user.id)
      .single();

    // 🔄 BUSCAR ESTATÍSTICAS REAIS
    const estatisticasReais = await buscarEstatisticasReais(user.id);

    if (alunoError || !alunoData) {
      console.log('❌ [ALUNO] Aluno não vinculado a nenhum professor ainda');
      // Se não encontrar dados reais, retornar estrutura básica
      const aluno = {
        id: user.id,
        nome: user.nome || 'Aluno',
        email: user.email,
        telefone: user.telefone || null,
        professor: null, // NULL = não vinculado
        estatisticas: estatisticasReais
      };

      return res.json({
        success: true,
        message: "Perfil do aluno (não vinculado)",
        data: aluno
      });
    }

    // Se chegou aqui, o aluno ESTÁ vinculado - buscar dados do professor
    console.log('✅ [ALUNO] Aluno vinculado ao professor:', alunoData.professor_id);
    
    const { data: professorData, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('nome, email, telefone')
      .eq('id', alunoData.professor_id)
      .single();

    const aluno = {
      id: user.id,
      nome: user.nome || 'Aluno',
      email: user.email,
      telefone: user.telefone || null,
      professor: professorData ? {
        id: alunoData.professor_id,
        nome: professorData.nome || "Professor",
        especialidade: "Ensino",
        telefone: professorData.telefone
      } : null,
      estatisticas: estatisticasReais
    };

    return res.json({
      success: true,
      message: "Perfil do aluno",
      data: aluno
    });

  } catch (error) {
    console.error('💥 [ALUNO] Erro ao buscar perfil do aluno:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔥 ROTA ATUALIZADA: GET /api/aluno/stats - Estatísticas REAIS do aluno
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    console.log('=== ESTATÍSTICAS REAIS DO ALUNO ===');
    
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('📊 [STATS] Buscando estatísticas REAIS para:', user.id, user.email);

    // 🔄 BUSCAR DADOS REAIS DAS TABELAS
    const statsReais = await buscarEstatisticasReais(user.id);

    console.log('✅ [STATS] Estatísticas REAIS calculadas:', statsReais);

    return res.json({
      success: true,
      message: "Estatísticas reais do aluno",
      data: {
        totalMaterials: statsReais.materiaisRecebidos,
        totalQuestions: statsReais.perguntasEnviadas,
        totalClasses: statsReais.aulasAgendadas,
        studyHours: statsReais.horasEstudo || 0
      }
    });

  } catch (error) {
    console.error('💥 [STATS] Erro ao buscar estatísticas reais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aluno/materiais - Materiais do aluno (CORRIGIDO)
router.get('/materiais', async (req, res) => {
  try {
    console.log('=== MATERIAIS DO ALUNO ===');
    
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('📚 [ALUNO] Buscando materiais para:', user.id);

    // 1. Buscar relacionamento aluno-professor
    const { data: alunoData, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select('professor_id')
      .eq('aluno_id', user.id)
      .eq('ativo', true)
      .single();

    if (alunoError || !alunoData) {
      console.log('❌ [ALUNO] Não vinculado a professor para materiais');
      return res.json({
        success: true,
        message: "Aluno não vinculado a professor",
        data: {
          professor: null,
          materiais: []
        }
      });
    }

    // 2. Buscar dados do professor
    const { data: professorData, error: professorError } = await supabaseAdmin
      .from('profiles')
      .select('id, nome, email')
      .eq('id', alunoData.professor_id)
      .single();

    if (professorError || !professorData) {
      console.log('⚠️ [ALUNO] Erro ao buscar dados do professor:', professorError);
      return res.json({
        success: true,
        message: "Erro ao buscar dados do professor",
        data: {
          professor: {
            id: alunoData.professor_id,
            nome: 'Professor',
            email: null
          },
          materiais: []
        }
      });
    }

    // 3. Buscar materiais/exercícios do professor
    const { data: materiais, error: materiaisError } = await supabaseAdmin
      .from('exercicios')
      .select('*')
      .eq('professor_id', alunoData.professor_id)
      .order('created_at', { ascending: false });

    if (materiaisError) {
      console.log('⚠️ [ALUNO] Erro ao buscar materiais:', materiaisError);
      return res.json({
        success: true,
        message: "Erro ao buscar materiais",
        data: {
          professor: {
            id: professorData.id,
            nome: professorData.nome,
            email: professorData.email
          },
          materiais: []
        }
      });
    }

    console.log(`✅ [ALUNO] ${materiais?.length || 0} materiais encontrados`);

    return res.json({
      success: true,
      message: "Materiais do aluno",
      data: {
        professor: {
          id: professorData.id,
          nome: professorData.nome,
          email: professorData.email
        },
        materiais: materiais || []
      }
    });

  } catch (error) {
    console.error('💥 [ALUNO] Erro ao buscar materiais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aluno/duvidas - Dúvidas do aluno (CORRIGIDO)
router.get('/duvidas', async (req, res) => {
  try {
    console.log('=== DÚVIDAS DO ALUNO ===');
    
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('❓ [ALUNO] Buscando dúvidas para:', user.id);

    // 1. Buscar relacionamento aluno-professor
    const { data: alunoData, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select('professor_id')
      .eq('aluno_id', user.id)
      .eq('ativo', true)
      .single();

    if (alunoError || !alunoData) {
      console.log('❌ [ALUNO] Não vinculado a professor para dúvidas');
      return res.json({
        success: true,
        message: "Aluno não vinculado a professor",
        data: {
          professor: null,
          duvidas: []
        }
      });
    }

    // 2. Buscar dados do professor
    const { data: professorData } = await supabaseAdmin
      .from('profiles')
      .select('nome')
      .eq('id', alunoData.professor_id)
      .single();

    // 3. Buscar dúvidas do aluno
    const { data: duvidas, error: duvidasError } = await supabaseAdmin
      .from('duvidas')
      .select('*')
      .eq('aluno_id', user.id)
      .eq('professor_id', alunoData.professor_id)
      .order('created_at', { ascending: false });

    if (duvidasError) {
      console.log('⚠️ [ALUNO] Tabela dúvidas pode não existir:', duvidasError);
    }

    console.log(`✅ [ALUNO] ${duvidas?.length || 0} dúvidas encontradas`);

    return res.json({
      success: true,
      message: "Dúvidas do aluno",
      data: {
        professor: {
          id: alunoData.professor_id,
          nome: professorData?.nome || 'Professor'
        },
        duvidas: duvidas || []
      }
    });

  } catch (error) {
    console.error('💥 [ALUNO] Erro ao buscar dúvidas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/aluno/duvidas - Criar nova dúvida (CORRIGIDO)
router.post('/duvidas', async (req, res) => {
  try {
    console.log('=== NOVA DÚVIDA DO ALUNO ===');
    
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { pergunta, assunto } = req.body;

    if (!pergunta?.trim()) {
      return res.status(400).json({ error: 'Pergunta é obrigatória' });
    }

    console.log('❓ [ALUNO] Criando dúvida para:', user.id);

    // 1. Buscar relacionamento aluno-professor
    const { data: alunoData, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select('professor_id')
      .eq('aluno_id', user.id)
      .eq('ativo', true)
      .single();

    if (alunoError || !alunoData) {
      return res.status(400).json({ error: 'Aluno não vinculado a nenhum professor' });
    }

    // 2. Criar dúvida
    const { data: novaDuvida, error: duvidasError } = await supabaseAdmin
      .from('duvidas')
      .insert([{
        aluno_id: user.id,
        professor_id: alunoData.professor_id,
        pergunta: pergunta.trim(),
        assunto: assunto?.trim() || 'Geral',
        respondida: false
      }])
      .select()
      .single();

    if (duvidasError) {
      console.error('❌ [ALUNO] Erro ao criar dúvida:', duvidasError);
      return res.status(400).json({ error: 'Erro ao criar dúvida' });
    }

    console.log('✅ [ALUNO] Dúvida criada com sucesso');

    return res.json({
      success: true,
      message: "Dúvida enviada com sucesso",
      data: novaDuvida
    });

  } catch (error) {
    console.error('💥 [ALUNO] Erro ao criar dúvida:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aluno/financeiro - Dados financeiros do aluno (CORRIGIDO)
router.get('/financeiro', async (req, res) => {
  try {
    console.log('=== FINANCEIRO DO ALUNO ===');
    
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('💰 [ALUNO] Buscando dados financeiros para:', user.id);

    // 1. Buscar relacionamento aluno-professor
    const { data: alunoData, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select('professor_id')
      .eq('aluno_id', user.id)
      .eq('ativo', true)
      .single();

    if (alunoError || !alunoData) {
      console.log('❌ [ALUNO] Não vinculado a professor para financeiro');
      return res.json({
        success: true,
        message: "Aluno não vinculado a professor",
        data: {
          professor: null,
          resumo: {
            totalPendente: 0,
            totalPago: 0,
            itensPendentes: 0,
            itensPagos: 0
          },
          itens: []
        }
      });
    }

    // 2. Buscar dados do professor
    const { data: professorData } = await supabaseAdmin
      .from('profiles')
      .select('nome')
      .eq('id', alunoData.professor_id)
      .single();

    // 3. Buscar dados financeiros do aluno
    const { data: financeiro, error: financeiroError } = await supabaseAdmin
      .from('financeiro')
      .select('*')
      .eq('aluno_id', user.id)
      .eq('professor_id', alunoData.professor_id)
      .order('data_vencimento', { ascending: false });

    if (financeiroError) {
      console.log('⚠️ [ALUNO] Tabela financeiro pode não existir:', financeiroError);
    }

    // 4. Calcular resumo
    const itens = financeiro || [];
    const resumo = {
      totalPendente: itens.filter(i => i.status === 'pendente').reduce((total, i) => total + (i.valor || 0), 0),
      totalPago: itens.filter(i => i.status === 'pago').reduce((total, i) => total + (i.valor || 0), 0),
      itensPendentes: itens.filter(i => i.status === 'pendente').length,
      itensPagos: itens.filter(i => i.status === 'pago').length
    };

    console.log(`✅ [ALUNO] ${itens.length} itens financeiros encontrados`);

    return res.json({
      success: true,
      message: "Dados financeiros do aluno",
      data: {
        professor: {
          nome: professorData?.nome || 'Professor'
        },
        resumo,
        itens
      }
    });

  } catch (error) {
    console.error('💥 [ALUNO] Erro ao buscar dados financeiros:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar via convite (vinculação automática)
router.post('/registrar-via-convite', async (req, res) => {
  try {
    console.log('=== REGISTRO VIA CONVITE - VINCULAÇÃO AUTOMÁTICA ===');
    
    const { token, user_id, user_email, user_name } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token do convite é obrigatório'
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    console.log('🎟️ Processando registro via convite:', {
      token,
      user_id,
      user_email,
      user_name
    });

    // 1. Buscar convite válido
    const { data: convite, error: conviteError } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('token', token)
      .eq('usado', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (conviteError || !convite) {
      console.error('❌ Convite não encontrado ou expirado:', conviteError);
      return res.status(404).json({
        success: false,
        error: 'Convite não encontrado ou expirado'
      });
    }

    console.log('✅ Convite válido encontrado:', convite.id, 'Professor:', convite.professor_id);

    // 2. Verificar se o perfil do professor existe
    const { data: professorProfile, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', convite.professor_id)
      .single();

    if (profError || !professorProfile) {
      console.error('❌ Professor não encontrado:', profError);
      return res.status(404).json({
        success: false,
        error: 'Professor não encontrado'
      });
    }

    // 3. Criar/atualizar perfil do aluno com vinculação ao professor
    const { data: alunoProfile, error: alunoProfileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user_id,
        nome: user_name || convite.nome || 'Aluno',
        email: user_email || convite.email,
        telefone: null,
        tipo: 'aluno',
        user_type: 'aluno',
        professor_id: convite.professor_id,  // VINCULAÇÃO AUTOMÁTICA!
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (alunoProfileError) {
      console.error('❌ Erro ao criar/atualizar perfil do aluno:', alunoProfileError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar perfil do aluno',
        details: alunoProfileError
      });
    }

    console.log('✅ Perfil do aluno criado/atualizado com vinculação:', alunoProfile);

    // 4. Criar relacionamento na tabela alunos
    const { data: relacionamento, error: relError } = await supabaseAdmin
      .from('alunos')
      .upsert({
        aluno_id: user_id,
        professor_id: convite.professor_id,
        observacoes: convite.observacoes || null,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (relError) {
      console.error('❌ Erro ao criar relacionamento aluno-professor:', relError);
      // Não é crítico - o importante é o professor_id no perfil
    } else {
      console.log('✅ Relacionamento aluno-professor criado:', relacionamento);
    }

    // 5. Marcar convite como usado
    const { error: markUsedError } = await supabaseAdmin
      .from('convites')
      .update({
        usado: true,
        usado_em: new Date().toISOString(),
        aluno_id: user_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', convite.id);

    if (markUsedError) {
      console.error('⚠️ Erro ao marcar convite como usado:', markUsedError);
    } else {
      console.log('✅ Convite marcado como usado');
    }

    console.log('🎉 VINCULAÇÃO AUTOMÁTICA CONCLUÍDA COM SUCESSO!');

    return res.json({
      success: true,
      message: 'Registro concluído e aluno vinculado automaticamente!',
      data: {
        aluno: {
          id: user_id,
          nome: alunoProfile.nome,
          email: alunoProfile.email,
          professor_id: convite.professor_id
        },
        professor: {
          id: professorProfile.id,
          nome: professorProfile.nome,
          email: professorProfile.email
        },
        vinculacao: {
          criada_em: new Date().toISOString(),
          via_convite: true,
          token_usado: token
        }
      }
    });

  } catch (error) {
    console.error('💥 Erro no registro via convite:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Verificar se usuário foi registrado via convite
router.post('/verificar-vinculacao-pendente', async (req, res) => {
  try {
    console.log('=== VERIFICAR VINCULAÇÃO PENDENTE ===');
    
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    console.log('🔍 Verificando se há convites pendentes para:', user_id);

    // Buscar convites não utilizados para este email
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(user_id);
    
    if (!user?.user?.email) {
      return res.json({
        success: true,
        has_pending_invite: false
      });
    }

    const { data: convitesPendentes, error } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('email', user.user.email)
      .eq('usado', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar convites pendentes:', error);
      return res.json({
        success: true,
        has_pending_invite: false
      });
    }

    if (convitesPendentes && convitesPendentes.length > 0) {
      const convite = convitesPendentes[0]; // Mais recente
      
      console.log('✅ Convite pendente encontrado:', convite.token);
      
      return res.json({
        success: true,
        has_pending_invite: true,
        convite: {
          token: convite.token,
          professor_id: convite.professor_id,
          nome_aluno: convite.nome,
          observacoes: convite.observacoes
        }
      });
    }

    return res.json({
      success: true,
      has_pending_invite: false
    });

  } catch (error) {
    console.error('💥 Erro ao verificar vinculação pendente:', error);
    return res.json({
      success: true,
      has_pending_invite: false
    });
  }
});

// Validar convite (verificar se token é válido) - COMPATIBILIDADE
router.get('/validar-convite/:token', async (req, res) => {
  try {
    console.log('=== VALIDAR CONVITE ===');
    
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token do convite é obrigatório'
      });
    }

    console.log('🔍 Validando convite com token:', token);

    // Buscar convite válido
    const { data: convite, error: conviteError } = await supabaseAdmin
      .from('convites')
      .select(`
        id,
        professor_id,
        nome,
        email,
        observacoes,
        valor_aula,
        data_vencimento,
        expires_at,
        usado,
        created_at
      `)
      .eq('token', token)
      .eq('usado', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (conviteError || !convite) {
      console.error('❌ Convite não encontrado ou expirado:', conviteError);
      return res.status(404).json({
        success: false,
        error: 'Convite não encontrado ou expirado'
      });
    }

    // Buscar dados do professor
    const { data: professor, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('id, nome, email, telefone, especialidade')
      .eq('id', convite.professor_id)
      .single();

    console.log('✅ Convite válido encontrado');

    return res.json({
      success: true,
      message: 'Convite válido',
      data: {
        convite: {
          id: convite.id,
          nome_aluno: convite.nome,
          email_aluno: convite.email,
          observacoes: convite.observacoes,
          valor_aula: convite.valor_aula,
          data_vencimento: convite.data_vencimento,
          expires_at: convite.expires_at,
          created_at: convite.created_at,
          token: token
        },
        professor: professor || { 
          id: convite.professor_id, 
          nome: 'Professor',
          email: null,
          telefone: null,
          especialidade: null
        }
      }
    });

  } catch (error) {
    console.error('💥 Erro ao validar convite:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Converter professor em aluno (quando há convite pendente)
router.post('/converter-para-aluno', async (req: AuthRequest, res) => {
  try {
    console.log('=== CONVERTER PROFESSOR EM ALUNO ===');
    
    const user = req.user;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuário não autenticado' 
      });
    }

    console.log('🔄 Convertendo usuário:', user.id, user.email, 'de', user.tipo, 'para aluno');

    // 1. Verificar se há convite pendente para este email
    const { data: convitesPendentes, error: conviteError } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('email', user.email)
      .eq('usado', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (conviteError || !convitesPendentes || convitesPendentes.length === 0) {
      console.error('❌ Nenhum convite pendente encontrado para:', user.email);
      return res.status(404).json({
        success: false,
        error: 'Nenhum convite pendente encontrado para este email'
      });
    }

    const convite = convitesPendentes[0];
    console.log('✅ Convite encontrado:', convite.id, 'Professor:', convite.professor_id);

    // 2. Atualizar perfil para aluno e vincular ao professor
    const { data: perfilAtualizado, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        tipo: 'aluno',
        user_type: 'aluno',
        professor_id: convite.professor_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar perfil',
        details: updateError
      });
    }

    console.log('✅ Perfil atualizado para aluno:', perfilAtualizado);

    // 3. Criar relacionamento na tabela alunos
    const { data: relacionamento, error: relError } = await supabaseAdmin
      .from('alunos')
      .upsert({
        aluno_id: user.id,
        professor_id: convite.professor_id,
        observacoes: convite.observacoes || null,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (relError) {
      console.error('❌ Erro ao criar relacionamento:', relError);
    } else {
      console.log('✅ Relacionamento criado:', relacionamento);
    }

    // 4. Marcar convite como usado
    const { error: markUsedError } = await supabaseAdmin
      .from('convites')
      .update({
        usado: true,
        usado_em: new Date().toISOString(),
        aluno_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', convite.id);

    if (markUsedError) {
      console.error('⚠️ Erro ao marcar convite como usado:', markUsedError);
    } else {
      console.log('✅ Convite marcado como usado');
    }

    // 5. Buscar dados do professor
    const { data: professor, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('id, nome, email, telefone')
      .eq('id', convite.professor_id)
      .single();

    console.log('🎉 CONVERSÃO E VINCULAÇÃO CONCLUÍDA COM SUCESSO!');

    return res.json({
      success: true,
      message: 'Usuário convertido para aluno e vinculado com sucesso!',
      data: {
        aluno: {
          id: user.id,
          nome: perfilAtualizado.nome,
          email: perfilAtualizado.email,
          tipo: 'aluno',
          professor_id: convite.professor_id
        },
        professor: professor || { 
          id: convite.professor_id, 
          nome: 'Professor' 
        },
        vinculacao: {
          criada_em: new Date().toISOString(),
          via_convite: true,
          token_usado: convite.token
        }
      }
    });

  } catch (error) {
    console.error('💥 Erro na conversão:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// 🔧 FUNÇÃO AUXILIAR: Buscar estatísticas reais do aluno
async function buscarEstatisticasReais(alunoId: string) {
  try {
    console.log('🔍 [ESTATÍSTICAS] Buscando dados reais para aluno:', alunoId);

    // Buscar relacionamento aluno-professor primeiro
    const { data: alunoData } = await supabaseAdmin
      .from('alunos')
      .select('professor_id')
      .eq('aluno_id', alunoId)
      .eq('ativo', true)
      .single();

    if (!alunoData) {
      console.log('📊 [STATS] Aluno não vinculado - retornando estatísticas zeradas');
      return {
        materiaisRecebidos: 0,
        perguntasEnviadas: 0,
        aulasAgendadas: 0,
        horasEstudo: 0
      };
    }

    const professorId = alunoData.professor_id;
    console.log('📊 [STATS] Professor vinculado:', professorId);

    // Buscar estatísticas reais em paralelo
    const [
      { data: exercicios },
      { data: duvidas },
      { data: aulas },
      { data: pagamentos }
    ] = await Promise.all([
      // Materiais/exercícios disponíveis para este aluno
      supabaseAdmin
        .from('exercicios')
        .select('id')
        .eq('professor_id', professorId),
      
      // Dúvidas enviadas por este aluno
      supabaseAdmin
        .from('duvidas')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('professor_id', professorId),
      
      // Aulas deste aluno
      supabaseAdmin
        .from('aulas')
        .select('id, duracao')
        .eq('aluno_id', alunoId)
        .eq('professor_id', professorId),
      
      // Pagamentos deste aluno
      supabaseAdmin
        .from('financeiro')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('professor_id', professorId)
    ]);

    // Calcular horas de estudo (soma da duração das aulas)
    const horasEstudo = (aulas || []).reduce((total: number, aula: any) => {
      return total + (aula.duracao || 0);
    }, 0);

    const stats = {
      materiaisRecebidos: exercicios?.length || 0,
      perguntasEnviadas: duvidas?.length || 0,
      aulasAgendadas: aulas?.length || 0,
      horasEstudo: Math.round(horasEstudo / 60) // Converter minutos para horas
    };

    console.log('📊 [STATS] Estatísticas calculadas:', stats);
    return stats;

  } catch (error) {
    console.error('💥 [STATS] Erro ao buscar estatísticas:', error);
    // Retornar estatísticas zeradas em caso de erro
    return {
      materiaisRecebidos: 0,
      perguntasEnviadas: 0,
      aulasAgendadas: 0,
      horasEstudo: 0
    };
  }
}

export default router; 