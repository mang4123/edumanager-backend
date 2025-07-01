import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// ==========================================
// ROTAS ALUNO - DADOS REAIS DO BANCO
// ==========================================

// GET /api/aluno/profile - Perfil do aluno
router.get('/profile', async (req, res) => {
  try {
    console.log('=== PERFIL DO ALUNO (DADOS REAIS) ===');
    
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('👤 [ALUNO] Buscando perfil para:', user.id, user.email);

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
router.get('/stats', async (req, res) => {
  try {
    console.log('=== ESTATÍSTICAS REAIS DO ALUNO ===');
    
    const user = (req as any).user;
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
      .select(`
        professor_id,
        professor:profiles (
          id,
          nome,
          email
        )
      `)
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

    // 2. Buscar materiais/exercícios do professor
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
            id: alunoData.professor_id,
            nome: alunoData.professor?.nome || 'Professor',
            email: alunoData.professor?.email
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
          id: alunoData.professor_id,
          nome: alunoData.professor?.nome || 'Professor',
          email: alunoData.professor?.email
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
      .order('data_pergunta', { ascending: false });

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
        assunto: assunto?.trim() || null,
        respondida: false,
        data_pergunta: new Date().toISOString()
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