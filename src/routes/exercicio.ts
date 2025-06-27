import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Listar exercícios
router.get('/', (req, res) => {
  res.json({ message: 'Lista de exercícios' });
});

// Criar exercício (apenas professor)
router.post('/', (req, res) => {
  res.json({ message: 'Exercício criado' });
});

// Enviar exercício para aluno
router.post('/:id/enviar', (req, res) => {
  res.json({ message: 'Exercício enviado' });
});

// Responder exercício (apenas aluno)
router.post('/:id/resposta', (req, res) => {
  res.json({ message: 'Resposta enviada' });
});

// Corrigir exercício (apenas professor)
router.post('/:id/correcao', (req, res) => {
  res.json({ message: 'Exercício corrigido' });
});

export { router as exercicioRoutes }; 