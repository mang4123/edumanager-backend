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
        totalMaterials: statsReais.materiaisDisponiveis,
        totalQuestions: statsReais.duvidaTotal,
        totalClasses: statsReais.aulasRealizadas,
        studyHours: statsReais.horasEstudo || 0
      }
    });

  } catch (error) {
    console.error('💥 [STATS] Erro ao buscar estatísticas reais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔧 FUNÇÃO AUXILIAR: Buscar estatísticas reais do aluno
async function buscarEstatisticasReais(alunoId: string) {
  try {
    console.log('🔍 [ESTATÍSTICAS] Buscando dados reais para aluno:', alunoId);

    // 1. 📚 MATERIAIS DISPONÍVEIS (exercícios)
    const { data: exercicios, error: exerciciosError } = await supabaseAdmin
      .from('exercicios')
      .select('id')
      .order('created_at', { ascending: false });

    const materiaisDisponiveis = exercicios?.length || 0;
    console.log('📚 [MATERIAIS] Total encontrado:', materiaisDisponiveis);

    // 2. ❓ DÚVIDAS DO ALUNO
    const { data: duvidas, error: duvidasError } = await supabaseAdmin
      .from('duvidas')
      .select('id, status')
      .eq('aluno_id', alunoId);

    const duvidaTotal = duvidas?.length || 0;
    const duvidasPendentes = duvidas?.filter(d => d.status === 'pendente').length || 0;
    console.log('❓ [DÚVIDAS] Total:', duvidaTotal, 'Pendentes:', duvidasPendentes);

    // 3. 🎓 AULAS REALIZADAS
    let aulasRealizadas = 0;
    try {
      const { data: aulas, error: aulasError } = await supabaseAdmin
        .from('aulas')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('status', 'realizada');

      aulasRealizadas = aulas?.length || 0;
      console.log('🎓 [AULAS] Realizadas:', aulasRealizadas);
    } catch (aulasError) {
      console.log('⚠️ [AULAS] Tabela não encontrada, usando 0');
    }

    // 4. 💰 PAGAMENTOS
    let proximoPagamento = null;
    try {
      const { data: pagamentos, error: pagamentosError } = await supabaseAdmin
        .from('financeiro')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('status', 'pendente')
        .order('data_vencimento', { ascending: true })
        .limit(1);

      proximoPagamento = pagamentos?.[0] || null;
      console.log('💰 [FINANCEIRO] Próximo pagamento:', proximoPagamento?.data_vencimento);
    } catch (financeiroError) {
      console.log('⚠️ [FINANCEIRO] Dados não encontrados');
    }

    // 5. ⏰ PRÓXIMA AULA
    let proximaAula = null;
    try {
      const dataAtual = new Date().toISOString().split('T')[0];
      const { data: proximasAulas, error: proximasAulasError } = await supabaseAdmin
        .from('aulas')
        .select('*')
        .eq('aluno_id', alunoId)
        .gte('data', dataAtual)
        .eq('status', 'agendada')
        .order('data', { ascending: true })
        .limit(1);

      proximaAula = proximasAulas?.[0] || null;
      console.log('⏰ [PRÓXIMA AULA]:', proximaAula?.data, proximaAula?.horario);
    } catch (proximaAulaError) {
      console.log('⚠️ [PRÓXIMA AULA] Não encontrada');
    }

    const estatisticas = {
      aulasRealizadas,
      exerciciosPendentes: duvidasPendentes,
      materiaisDisponiveis,
      proximaAula: proximaAula ? {
        data: proximaAula.data,
        horario: proximaAula.horario,
        materia: proximaAula.materia || 'Aula'
      } : null,
      duvidaTotal,
      duvidasPendentes,
      proximoPagamento: proximoPagamento ? {
        valor: proximoPagamento.valor,
        vencimento: proximoPagamento.data_vencimento
      } : null,
      horasEstudo: Math.floor(aulasRealizadas * 1.5) // Estimativa: 1.5h por aula
    };

    console.log('✅ [ESTATÍSTICAS REAIS] Calculadas:', estatisticas);
    return estatisticas;

  } catch (error) {
    console.error('💥 [ESTATÍSTICAS] Erro ao buscar dados reais:', error);
    // Retornar valores padrão em caso de erro
    return {
      aulasRealizadas: 0,
      exerciciosPendentes: 0,
      materiaisDisponiveis: 0,
      proximaAula: null,
      duvidaTotal: 0,
      duvidasPendentes: 0,
      proximoPagamento: null,
      horasEstudo: 0
    };
  }
}

// GET /api/aluno/materiais - Lista de materiais do aluno (REAL)
router.get('/materiais', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('📚 [MATERIAIS] Buscando materiais reais para:', user.id);

    // Buscar exercícios do banco
    const { data: exercicios, error } = await supabaseAdmin
      .from('exercicios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [MATERIAIS] Erro ao buscar exercícios:', error);
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

    console.log('✅ [MATERIAIS] Total encontrado:', materiais.length);

    return res.json({
      message: "Lista real de materiais do aluno",
      data: materiais
    });

  } catch (error) {
    console.error('💥 [MATERIAIS] Erro ao buscar materiais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aluno/duvidas - Dúvidas do aluno (REAL)
router.get('/duvidas', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('❓ [DÚVIDAS] Buscando dúvidas reais para:', user.id);

    const { data: duvidas, error } = await supabaseAdmin
      .from('duvidas')
      .select('*')
      .eq('aluno_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [DÚVIDAS] Erro ao buscar dúvidas:', error);
    }

    console.log('✅ [DÚVIDAS] Total encontrado:', duvidas?.length || 0);

    return res.json({
      message: "Dúvidas reais do aluno",
      data: duvidas || []
    });

  } catch (error) {
    console.error('💥 [DÚVIDAS] Erro ao buscar dúvidas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aluno/financeiro - Dados financeiros do aluno (REAL)
router.get('/financeiro', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    console.log('💰 [FINANCEIRO] Buscando dados reais para:', user.id);

    const { data: pagamentos, error } = await supabaseAdmin
      .from('financeiro')
      .select('*')
      .eq('aluno_id', user.id)
      .order('data_vencimento', { ascending: false });

    if (error) {
      console.error('❌ [FINANCEIRO] Erro ao buscar dados financeiros:', error);
    }

    // Calcular próximo pagamento
    const proximoPagamento = pagamentos?.find(p => p.status === 'pendente') || null;

    const dadosFinanceiros = {
      proximoPagamento,
      historico: pagamentos || []
    };

    console.log('✅ [FINANCEIRO] Pagamentos encontrados:', pagamentos?.length || 0);

    return res.json({
      message: "Dados financeiros reais do aluno",
      data: dadosFinanceiros
    });

  } catch (error) {
    console.error('💥 [FINANCEIRO] Erro ao buscar dados financeiros:', error);
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

    console.log('➕ [NOVA DÚVIDA] Criando para:', user.id, 'Assunto:', assunto);

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
      console.error('❌ [NOVA DÚVIDA] Erro ao criar dúvida:', error);
      return res.status(500).json({ error: 'Erro ao criar dúvida' });
    }

    console.log('✅ [NOVA DÚVIDA] Criada com sucesso:', novaDuvida.id);

    return res.json({
      message: 'Dúvida enviada com sucesso',
      data: novaDuvida
    });

  } catch (error) {
    console.error('💥 [NOVA DÚVIDA] Erro ao criar dúvida:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 