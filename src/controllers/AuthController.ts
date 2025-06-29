import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  // Registro genérico baseado no role
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;

      if (!role) {
        throw createError('Campo role é obrigatório (professor ou aluno)', 400);
      }

      switch (role) {
        case 'professor':
          return this.registerProfessor(req, res, next);
        case 'aluno':
          return this.registerAluno(req, res, next);
        default:
          throw createError('Role inválido. Use: professor ou aluno', 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Registrar Professor
  async registerProfessor(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, nome, especialidade, areaAtuacao, telefone } = req.body;
      
      // Mapear areaAtuacao para especialidade se necessário
      const especialidadeFinal = especialidade || areaAtuacao;

      if (!email || !password || !nome) {
        throw createError('Email, senha e nome são obrigatórios', 400);
      }

      // Verificar se email já existe
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw createError('Email já está em uso', 400);
      }

      // Gerar ID único e hash da senha
      const userId = uuidv4();
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const profileData = {
        id: userId,
        email,
        nome,
        tipo: 'professor',
        especialidade: especialidadeFinal,
        telefone,
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
      };
      
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        throw createError(`Erro ao criar perfil: ${profileError.message}`, 400);
      }

      // Gerar JWT token
      const token = jwt.sign(
        { 
          userId, 
          email, 
          tipo: 'professor' 
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Professor registrado com sucesso',
        user: {
          id: userId,
          email,
          nome,
          tipo: 'professor',
          role: 'professor', // Adicionar campo role para compatibilidade com frontend
          especialidade: especialidadeFinal
        },
        access_token: token,
        token: token, // Adicionar token com nome alternativo para compatibilidade
        auth_token: token // Adicionar auth_token para compatibilidade com Lovable
      });
    } catch (error) {
      next(error);
    }
  }

  // Registrar Aluno
  async registerAluno(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, nome, telefone, professor_id } = req.body;

      if (!email || !password || !nome) {
        throw createError('Email, senha e nome são obrigatórios', 400);
      }

      // Verificar se email já existe
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw createError('Email já está em uso', 400);
      }

      // Verificar se o professor existe (apenas se professor_id foi fornecido)
      if (professor_id) {
        const { data: professor } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', professor_id)
          .eq('tipo', 'professor')
          .single();

        if (!professor) {
          throw createError('Professor não encontrado', 404);
        }
      }

      // Gerar ID único e hash da senha
      const userId = uuidv4();
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const profileData = {
        id: userId,
        email,
        nome,
        tipo: 'aluno',
        telefone,
        professor_id, // Pode ser null
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        throw createError(`Erro ao criar perfil: ${profileError.message}`, 400);
      }

      // Gerar JWT token
      const token = jwt.sign(
        { 
          userId, 
          email, 
          tipo: 'aluno' 
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Aluno registrado com sucesso',
        user: {
          id: userId,
          email,
          nome,
          tipo: 'aluno',
          role: 'aluno' // Adicionar campo role para compatibilidade com frontend
        },
        access_token: token,
        token: token, // Adicionar token com nome alternativo para compatibilidade
        auth_token: token // Adicionar auth_token para compatibilidade com Lovable
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req: Request, res: Response, next: NextFunction) {
    // Timeout de 10 segundos para evitar travamento
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Login timeout - operação demorou mais de 10s')), 10000);
    });

    try {
      await Promise.race([
        this.performLogin(req, res, next),
        timeoutPromise
      ]);
    } catch (error) {
      next(error);
    }
  }

  // Método separado para realizar o login
  private async performLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createError('Email e senha são obrigatórios', 400);
      }
      
      // Buscar usuário na tabela profiles
      try {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (profileError || !profile) {
          throw createError('Credenciais inválidas', 401);
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, profile.password_hash);

        if (!isPasswordValid) {
          throw createError('Credenciais inválidas', 401);
        }

        // Gerar JWT token
        const token = jwt.sign(
          { 
            userId: profile.id, 
            email: profile.email, 
            tipo: profile.tipo 
          },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );

        // Remover password_hash da resposta e adicionar role
        const { password_hash, ...userProfile } = profile;

        const response = {
          message: 'Login realizado com sucesso',
          user: {
            ...userProfile,
            role: profile.tipo // Adicionar campo role para compatibilidade com frontend
          },
          access_token: token,
          token: token, // Adicionar token com nome alternativo para compatibilidade
          auth_token: token // Adicionar auth_token para compatibilidade com Lovable
        };

        res.json(response);
        
      } catch (dbError) {
        throw createError('Erro interno do servidor', 500);
      }
      
    } catch (error) {
      throw error; // Re-throw para ser capturado pelo método principal
    }
  }

  // Logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw createError('Erro ao fazer logout', 400);
      }

      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Esqueci a senha
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw createError('Email é obrigatório', 400);
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) {
        throw createError('Erro ao enviar email de recuperação', 400);
      }

      res.json({ 
        message: 'Email de recuperação enviado com sucesso' 
      });
    } catch (error) {
      next(error);
    }
  }

  // Redefinir senha
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, access_token } = req.body;

      if (!password || !access_token) {
        throw createError('Senha e token são obrigatórios', 400);
      }

      const { error } = await supabase.auth.updateUser({ 
        password 
      });

      if (error) {
        throw createError('Erro ao redefinir senha', 400);
      }

      res.json({ 
        message: 'Senha redefinida com sucesso' 
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter perfil
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw createError('Usuário não autenticado', 401);
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw createError('Erro ao buscar perfil', 400);
      }

      res.json({ profile });
    } catch (error) {
      next(error);
    }
  }
} 