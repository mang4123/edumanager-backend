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

    if (alunoError || !alunoData) {
      console.log('❌ [ALUNO] Aluno não vinculado a nenhum professor ainda');
      // Se não encontrar dados reais, retornar estrutura básica
      const aluno = {
        id: user.id,
        nome: user.nome || 'Aluno',
        email: user.email,
        telefone: user.telefone || null,
        professor: null, // NULL = não vinculado
        estatisticas: {
          aulasRealizadas: 0,
          exerciciosPendentes: 0,
          materiaisDisponiveis: 0,
          proximaAula: null
        }
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
        nome: professorData.nome || "Professor",
        especialidade: "Ensino",
        telefone: professorData.telefone
      } : null,
      estatisticas: {
        aulasRealizadas: 0,
        exerciciosPendentes: 0,
        materiaisDisponiveis: 0,
        proximaAula: null
      }
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

// 🔥 NOVA ROTA: GET /api/aluno/stats - Estatísticas do aluno
router.get('/stats', async (req, res) => {
  try {
    console.log('=== ESTATÍSTICAS DO ALUNO ===');
    
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('📊 [STATS] Buscando estatísticas para:', user.id, user.email);

    // Buscar estatísticas reais ou simuladas
    const stats = {
      totalMaterials: 12,
      totalQuestions: 3,
      totalClasses: 8,
      studyHours: 24
    };

    console.log('✅ [STATS] Estatísticas geradas:', stats);

    return res.json({
      success: true,
      message: "Estatísticas do aluno",
      data: stats
    });

  } catch (error) {
    console.error('💥 [STATS] Erro ao buscar estatísticas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aluno/materiais - Lista de materiais do aluno
router.get('/materiais', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar exercícios do banco
    const { data: exercicios, error } = await supabaseAdmin
      .from('exercicios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar exercícios:', error);
    }

    const materiais = exercicios?.map(ex => ({
      id: ex.id,
      titulo: ex.titulo,
      descricao: ex.descricao,
      tipo: 'exercicio',
      materia: ex.materia,
      professor: 'Professor',
      dataEnvio: ex.created_at?.split('T')[0],
      prazo: ex.prazo,
      status: 'disponivel',
      arquivo: ex.anexo_url
    })) || [];

    return res.json({
      message: "Lista de materiais do aluno",
      data: materiais
    });

  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aluno/duvidas - Dúvidas do aluno
router.get('/duvidas', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { data: duvidas, error } = await supabaseAdmin
      .from('duvidas')
      .select('*')
      .eq('aluno_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dúvidas:', error);
    }

    return res.json({
      message: "Dúvidas do aluno",
      data: duvidas || []
    });

  } catch (error) {
    console.error('Erro ao buscar dúvidas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aluno/financeiro - Dados financeiros do aluno
router.get('/financeiro', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { data: pagamentos, error } = await supabaseAdmin
      .from('financeiro')
      .select('*')
      .eq('aluno_id', user.id)
      .order('data_vencimento', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    }

    const dadosFinanceiros = {
      proximoPagamento: null,
      historico: pagamentos || []
    };

    return res.json({
      message: "Dados financeiros do aluno",
      data: dadosFinanceiros
    });

  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/aluno/duvidas - Criar nova dúvida
router.post('/duvidas', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { assunto, pergunta, materia, urgencia } = req.body;

    if (!assunto || !pergunta) {
      return res.status(400).json({ error: 'Assunto e pergunta são obrigatórios' });
    }

    const { data: novaDuvida, error } = await supabaseAdmin
      .from('duvidas')
      .insert({
        aluno_id: user.id,
        professor_id: 'e650f5ee-747b-4574-9bfa-8e2d411c4974',
        assunto,
        pergunta,
        materia: materia || 'Geral',
        urgencia: urgencia || 'normal',
        status: 'pendente'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar dúvida:', error);
      return res.status(500).json({ error: 'Erro ao criar dúvida' });
    }

    return res.json({
      message: 'Dúvida enviada com sucesso',
      data: novaDuvida
    });

  } catch (error) {
    console.error('Erro ao criar dúvida:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 