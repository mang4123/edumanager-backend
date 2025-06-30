import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Rota de status da API
router.get('/status', (req, res) => {
  res.json({ 
    message: 'API de autenticação ativa',
    note: 'Autenticação gerenciada pelo Supabase via frontend',
    backend_role: 'Lógica de negócio e APIs customizadas'
  });
});

// Obter dados do usuário atual (token vem do Supabase frontend)
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Usuário autenticado com sucesso',
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as authRoutes }; 