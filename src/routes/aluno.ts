import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
router.use(requireRole(['aluno']));

// Dashboard do aluno
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Dashboard do aluno' });
});

// Aulas
router.get('/aulas', (req, res) => {
  res.json({ message: 'Lista de aulas agendadas' });
});

// Exercícios
router.get('/exercicios', (req, res) => {
  res.json({ message: 'Lista de exercícios recebidos' });
});

router.post('/exercicios/:id/resposta', (req, res) => {
  res.json({ message: 'Resposta enviada' });
});

// Agenda
router.get('/agenda', (req, res) => {
  res.json({ message: 'Agenda de aulas' });
});

export { router as alunoRoutes }; 