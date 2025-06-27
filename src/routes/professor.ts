import { Router } from 'express';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
router.use(requireRole(['professor']));

// Dashboard do professor
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Dashboard do professor' });
});

// Gerenciar alunos
router.get('/alunos', (req, res) => {
  res.json({ message: 'Lista de alunos' });
});

router.post('/alunos/convite', (req, res) => {
  res.json({ message: 'Convite enviado para aluno' });
});

// Aulas
router.get('/aulas', (req, res) => {
  res.json({ message: 'Lista de aulas do professor' });
});

router.post('/aulas', (req, res) => {
  res.json({ message: 'Aula criada' });
});

// Exercícios
router.get('/exercicios', (req, res) => {
  res.json({ message: 'Lista de exercícios' });
});

router.post('/exercicios', (req, res) => {
  res.json({ message: 'Exercício criado' });
});

// Financeiro
router.get('/financeiro', (req, res) => {
  res.json({ message: 'Relatório financeiro' });
});

export { router as professorRoutes }; 