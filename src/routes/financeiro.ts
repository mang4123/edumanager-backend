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
      totalRecebido: 0,
      totalPendente: 0,
      pagamentosRecentes: []
    }
  });
});

// Relatório financeiro
router.get('/relatorio', (req, res) => {
  res.json({ message: 'Relatório financeiro' });
});

// Listar pagamentos
router.get('/pagamentos', (req, res) => {
  res.json({ message: 'Lista de pagamentos' });
});

// Registrar pagamento
router.post('/pagamentos', (req, res) => {
  res.json({ message: 'Pagamento registrado' });
});

// Gerar cobrança
router.post('/cobrancas', (req, res) => {
  res.json({ message: 'Cobrança gerada' });
});

export { router as financeiroRoutes }; 