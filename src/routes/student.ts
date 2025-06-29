import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação e role de aluno para todas as rotas
router.use(authenticateToken);
router.use(requireRole(['aluno']));

// GET /api/student/profile - Alias para perfil do aluno
router.get('/profile', (req, res) => {
  console.log('=== PERFIL DO STUDENT (ALIAS ALUNO) ===');
  
  const user = (req as any).user;
  
  const aluno = {
    id: user.id,
    nome: user.nome || 'Aluno',
    email: user.email,
    telefone: user.telefone || null,
    tipo: user.tipo,
    professor: {
      nome: "Professor Exemplo",
      especialidade: "Matemática e Português",
      telefone: "(11) 99999-9999"
    },
    estatisticas: {
      aulasRealizadas: 24,
      exerciciosPendentes: 3,
      materiaisDisponiveis: 2,
      proximaAula: {
        data: "2024-01-15",
        horario: "15:00",
        materia: "Matemática"
      }
    }
  };

  res.json({
    message: "Perfil do aluno",
    data: aluno
  });
});

// GET /api/student/classes - Alias para aulas do aluno
router.get('/classes', (req, res) => {
  console.log('=== AULAS DO STUDENT (ALIAS ALUNO) ===');
  
  const aulas = [
    {
      id: 1,
      data: "2024-01-15",
      horario: "15:00",
      materia: "Matemática",
      professor: "Professor Exemplo",
      status: "agendada",
      tipo: "presencial",
      topico: "Equações do 2º grau"
    },
    {
      id: 2,
      data: "2024-01-12",
      horario: "14:00",
      materia: "Português",
      professor: "Professor Exemplo",
      status: "realizada",
      tipo: "online",
      topico: "Redação dissertativa",
      avaliacao: 5
    }
  ];

  res.json({
    message: "Aulas do aluno",
    data: aulas
  });
});

export default router; 