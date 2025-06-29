import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Rotas de autenticação
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/register/professor', (req, res, next) => authController.registerProfessor(req, res, next));

// ❌ REGISTRO DIRETO DE ALUNO DESABILITADO - APENAS VIA CONVITE
router.post('/register/aluno', (req, res) => {
  res.status(403).json({
    message: 'Registro de aluno desabilitado. Use apenas convites de professores.',
    error: 'REGISTRO_DIRETO_NEGADO'
  });
});
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));
router.get('/profile', (req, res, next) => authController.getProfile(req, res, next));

// === SISTEMA DE CONVITES ===
// Validar token de convite
router.get('/convite/:token/validar', (req: any, res) => {
  const { token } = req.params;
  
  try {
    // Buscar convite no estado global
    const convite = req.estadoGlobal?.convitesGerados?.find(
      (c: any) => c.token === token || c.id === token
    );
    
    if (!convite) {
      return res.status(404).json({
        valido: false,
        motivo: 'Convite não encontrado no sistema'
      });
    }
    
    // Verificar se não expirou
    const agora = new Date();
    const validoAte = new Date(convite.validoAte);
    
    if (agora > validoAte) {
      return res.status(400).json({
        valido: false,
        motivo: 'Convite expirado',
        dataExpiracao: convite.validoAte
      });
    }
    
    // Verificar se já foi usado
    if (convite.usado) {
      return res.status(400).json({
        valido: false,
        motivo: 'Este convite já foi utilizado'
      });
    }
    
    return res.json({
      valido: true,
      dadosAluno: {
        nome: convite.nomeAluno,
        email: convite.emailAluno,
        telefone: convite.telefoneAluno
      },
      professor: {
        id: convite.professorId
      },
      dataGeracao: convite.dataGeracao,
      validoAte: convite.validoAte,
      diasRestantes: Math.ceil((validoAte.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
    });
    
  } catch (error) {
    return res.status(400).json({
      valido: false,
      motivo: 'Token inválido ou malformado'
    });
  }
});

// Registro de aluno via convite
router.post('/register/aluno/convite', (req: any, res, next) => {
  const { conviteToken, password, confirmPassword } = req.body;
  
  try {
    // Buscar e validar convite
    const convite = req.estadoGlobal?.convitesGerados?.find(
      (c: any) => c.token === conviteToken || c.id === conviteToken
    );
    
    if (!convite) {
      return res.status(404).json({
        message: 'Convite não encontrado'
      });
    }
    
    if (convite.usado) {
      return res.status(400).json({
        message: 'Este convite já foi utilizado'
      });
    }
    
    const agora = new Date();
    const validoAte = new Date(convite.validoAte);
    
    if (agora > validoAte) {
      return res.status(400).json({
        message: 'Convite expirado'
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Senhas não conferem'
      });
    }
    
    // Preparar dados para registro
    req.body = {
      nome: convite.nomeAluno,
      email: convite.emailAluno,
      telefone: convite.telefoneAluno,
      password: password,
      professor_id: convite.professorId,
      viaConvite: true
    };
    
    // Marcar convite como usado
    convite.usado = true;
    convite.dataUso = new Date().toISOString();
    
    // Chamar controller de registro de aluno
    return authController.registerAluno(req, res, next);
    
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

export { router as authRoutes }; 