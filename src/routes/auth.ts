import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Rotas de autenticação
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/register/professor', (req, res, next) => authController.registerProfessor(req, res, next));
router.post('/register/aluno', (req, res, next) => authController.registerAluno(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));
router.get('/profile', (req, res, next) => authController.getProfile(req, res, next));

export { router as authRoutes }; 