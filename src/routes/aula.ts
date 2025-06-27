import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Listar aulas (professor e aluno)
router.get('/', (req, res) => {
  res.json({ message: 'Lista de aulas' });
});

// Agendar aula (apenas professor)
router.post('/', (req, res) => {
  res.json({ message: 'Aula agendada' });
});

// Reagendar aula
router.put('/:id/reagendar', (req, res) => {
  res.json({ message: 'Aula reagendada' });
});

// Cancelar aula
router.delete('/:id', (req, res) => {
  res.json({ message: 'Aula cancelada' });
});

// Marcar presença
router.post('/:id/presenca', (req, res) => {
  res.json({ message: 'Presença marcada' });
});

export { router as aulaRoutes }; 