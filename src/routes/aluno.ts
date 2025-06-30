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

    // Buscar dados reais do aluno
    const { data: alunoData, error: alunoError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        alunos!inner(
          professor_id,
          ativo,
          professor:profiles!alunos_professor_id_fkey(nome, email, telefone)
        )
      `)
      .eq('id', user.id)
      .eq('tipo', 'aluno')
      .single();

    if (alunoError || !alunoData) {
      // Se não encontrar dados reais, retornar estrutura básica
      const aluno = {
        id: user.id,
        nome: user.nome || 'Aluno',
        email: user.email,
        telefone: user.telefone || null,
        professor: {
          nome: "Sem professor atribuído",
          especialidade: "N/A",
          telefone: null
        },
        estatisticas: {
          aulasRealizadas: 0,
          exerciciosPendentes: 0,
          materiaisDisponiveis: 0,
          proximaAula: null
        }
      };

      return res.json({
        message: "Perfil do aluno",
        data: aluno
      });
    }

    // Buscar estatísticas reais se existir dados
    const aluno = {
      id: user.id,
      nome: alunoData.nome,
      email: alunoData.email,
      telefone: alunoData.telefone,
      professor: {
        nome: alunoData.alunos[0]?.professor?.nome || "Professor",
        especialidade: alunoData.alunos[0]?.professor?.especialidade || "Ensino",
        telefone: alunoData.alunos[0]?.professor?.telefone
      },
      estatisticas: {
        aulasRealizadas: 0,
        exerciciosPendentes: 0,
        materiaisDisponiveis: 0,
        proximaAula: null
      }
    };

    res.json({
      message: "Perfil do aluno",
      data: aluno
    });

  } catch (error) {
    console.error('Erro ao buscar perfil do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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

    res.json({
      message: "Lista de materiais do aluno",
      data: materiais
    });

  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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

    res.json({
      message: "Dúvidas do aluno",
      data: duvidas || []
    });

  } catch (error) {
    console.error('Erro ao buscar dúvidas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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

    res.json({
      message: "Dados financeiros do aluno",
      data: dadosFinanceiros
    });

  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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

    res.json({
      message: 'Dúvida enviada com sucesso',
      data: novaDuvida
    });

  } catch (error) {
    console.error('Erro ao criar dúvida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 