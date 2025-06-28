import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
router.use(requireRole(['professor'])); // Apenas professores têm acesso

// Rota principal para dados financeiros (compatibilidade com frontend)
router.get('/', (req, res) => {
  res.json({ 
    message: 'Dados financeiros', 
    data: {
      totalRecebido: 2400.00,
      totalPendente: 800.00,
      receitaMensal: 2400.00,
      crescimento: 15,
      alunosAtivos: 3,
      aulasMes: 12,
      pendencias: 1,
      pagamentosRecentes: [
        {
          id: 1,
          aluno: 'Ana Silva',
          valor: 120.00,
          data: '2024-01-15',
          status: 'recebido'
        },
        {
          id: 2,
          aluno: 'Carlos Santos', 
          valor: 150.00,
          data: '2024-01-14',
          status: 'recebido'
        },
        {
          id: 3,
          aluno: 'Maria Oliveira',
          valor: 120.00,
          data: '2024-01-13',
          status: 'pendente'
        }
      ]
    }
  });
});

// Relatório financeiro detalhado
router.get('/relatorio', (req, res) => {
  res.json({ 
    message: 'Relatório financeiro detalhado',
    data: {
      periodo: 'Janeiro 2024',
      totalRecebido: 2400.00,
      totalPendente: 800.00,
      totalAulas: 12,
      mediaAula: 100.00,
      breakdown: {
        semana1: 600.00,
        semana2: 800.00,
        semana3: 700.00,
        semana4: 300.00
      },
      topAlunos: [
        { nome: 'Carlos Santos', valor: 450.00, aulas: 4 },
        { nome: 'Ana Silva', valor: 350.00, aulas: 3 },
        { nome: 'Maria Oliveira', valor: 250.00, aulas: 2 }
      ]
    }
  });
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