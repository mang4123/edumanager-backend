import { Router } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
router.use(requireRole(['professor'])); // Apenas professores têm acesso

// Rota principal para dados financeiros (compatibilidade com frontend)
router.get('/', async (req: AuthRequest, res) => {
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
      throw error;
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

    const crescimento = totalRecebido > 0 ? Math.round((totalRecebido / 1000) * 100) : 0;
    const alunosAtivos = new Set(dadosFinanceiros?.map(d => d.aluno_id)).size;
    const aulasMes = dadosFinanceiros?.filter(d => {
      const dataTransacao = new Date(d.created_at || '');
      const agora = new Date();
      return dataTransacao.getMonth() === agora.getMonth() && 
             dataTransacao.getFullYear() === agora.getFullYear();
    }).length || 0;

    res.json({ 
      message: 'Dados financeiros', 
      data: {
        totalRecebido,
        totalPendente,
        receitaMensal: totalRecebido,
        crescimento,
        alunosAtivos,
        aulasMes,
        pendencias: dadosFinanceiros?.filter(d => d.status === 'pendente').length || 0,
        pagamentosRecentes
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório financeiro detalhado
router.get('/relatorio', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const { data: dadosFinanceiros, error } = await supabaseAdmin
      .from('financeiro')
      .select(`
        *,
        aluno:profiles!financeiro_aluno_id_fkey(nome)
      `)
      .eq('professor_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const totalRecebido = dadosFinanceiros?.filter(d => d.status === 'pago').reduce((sum, d) => sum + (d.valor || 0), 0) || 0;
    const totalPendente = dadosFinanceiros?.filter(d => d.status === 'pendente').reduce((sum, d) => sum + (d.valor || 0), 0) || 0;
    const totalAulas = dadosFinanceiros?.length || 0;
    const mediaAula = totalAulas > 0 ? totalRecebido / totalAulas : 0;

    // Agrupar por aluno
    const alunosMap = new Map();
    dadosFinanceiros?.forEach(d => {
      const alunoNome = d.aluno?.nome || 'Aluno';
      if (!alunosMap.has(alunoNome)) {
        alunosMap.set(alunoNome, { nome: alunoNome, valor: 0, aulas: 0 });
      }
      const aluno = alunosMap.get(alunoNome);
      if (d.status === 'pago') {
        aluno.valor += d.valor || 0;
      }
      aluno.aulas += 1;
    });

    const topAlunos = Array.from(alunosMap.values())
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 3);

    res.json({ 
      message: 'Relatório financeiro detalhado',
      data: {
        periodo: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        totalRecebido,
        totalPendente,
        totalAulas,
        mediaAula: Number(mediaAula.toFixed(2)),
        breakdown: {
          semana1: 0, // Pode ser implementado com lógica de semanas
          semana2: 0,
          semana3: 0,
          semana4: 0
        },
        topAlunos
      }
    });
  } catch (error) {
    console.error('Erro ao buscar relatório financeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todos os pagamentos
router.get('/pagamentos', (req, res) => {
  res.json({ 
    message: 'Lista de pagamentos',
    data: [
      {
        id: 1,
        aluno: {
          id: 1,
          nome: 'Ana Silva',
          email: 'ana@email.com'
        },
        valor: 120.00,
        data: '2024-01-15',
        vencimento: '2024-01-15',
        status: 'recebido',
        metodo: 'pix',
        aulas: 1
      },
      {
        id: 2,
        aluno: {
          id: 2,
          nome: 'Carlos Santos',
          email: 'carlos@email.com'
        },
        valor: 150.00,
        data: '2024-01-14',
        vencimento: '2024-01-14',
        status: 'recebido',
        metodo: 'transferencia',
        aulas: 1
      },
      {
        id: 3,
        aluno: {
          id: 3,
          nome: 'Maria Oliveira',
          email: 'maria@email.com'
        },
        valor: 120.00,
        data: null,
        vencimento: '2024-01-20',
        status: 'pendente',
        metodo: null,
        aulas: 1
      }
    ]
  });
});

// Registrar novo pagamento
router.post('/pagamentos', (req, res) => {
  console.log('=== REGISTRAR PAGAMENTO ===');
  console.log('Dados recebidos:', req.body);
  
  const { alunoId, valor, data, metodo, observacoes } = req.body;
  
  res.json({ 
    message: 'Pagamento registrado com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 100,
      alunoId,
      valor: parseFloat(valor),
      data: data || new Date().toISOString().split('T')[0],
      metodo: metodo || 'dinheiro',
      observacoes: observacoes || '',
      status: 'recebido',
      dataRegistro: new Date().toISOString()
    }
  });
});

// Marcar pagamento como recebido
router.patch('/pagamentos/:id/receber', (req, res) => {
  const { id } = req.params;
  const { metodo, data } = req.body;
  
  res.json({
    message: 'Pagamento marcado como recebido',
    data: {
      pagamentoId: parseInt(id),
      status: 'recebido',
      metodo: metodo || 'dinheiro',
      dataRecebimento: data || new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    }
  });
});

// Gerar cobrança
router.post('/cobrancas', (req, res) => {
  console.log('=== GERAR COBRANÇA ===');
  console.log('Dados recebidos:', req.body);
  
  const { alunoId, valor, vencimento, descricao } = req.body;
  
  res.json({ 
    message: 'Cobrança gerada com sucesso',
    data: {
      id: Math.floor(Math.random() * 1000) + 200,
      alunoId,
      valor: parseFloat(valor),
      vencimento,
      descricao: descricao || 'Pagamento de aulas',
      status: 'pendente',
      dataGeracao: new Date().toISOString(),
      linkPagamento: `https://pagamento.exemplo.com/cobranca/${Math.random().toString(36).substr(2, 9)}`
    }
  });
});

// Estatísticas financeiras por período
router.get('/stats/:periodo', (req, res) => {
  const { periodo } = req.params; // ex: 2024-01, 2024, etc
  
  res.json({
    message: `Estatísticas financeiras - ${periodo}`,
    data: {
      periodo,
      totalRecebido: 2400.00,
      totalPendente: 800.00,
      crescimento: 15.5,
      aulasRealizadas: 12,
      mediaAula: 100.00,
      diasTrabalhados: 20,
      mediaDiaria: 120.00
    }
  });
});

// Exportar relatório (simular)
router.get('/exportar/:formato', (req, res) => {
  const { formato } = req.params; // pdf, excel, csv
  
  res.json({
    message: `Relatório exportado em ${formato.toUpperCase()}`,
    data: {
      formato,
      url: `/downloads/relatorio-financeiro-${Date.now()}.${formato}`,
      dataGeracao: new Date().toISOString(),
      tamanho: '2.5MB'
    }
  });
});

export { router as financeiroRoutes }; 