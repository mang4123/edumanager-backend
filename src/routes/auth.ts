import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Rotas de autenticação
router.post('/register', authController.register);
router.post('/register/professor', authController.registerProfessor);
router.post('/register/aluno', authController.registerAluno);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', authController.getProfile);

export { router as authRoutes }; 