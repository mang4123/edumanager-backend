import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

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

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw createError(`Erro ao criar conta: ${authError.message}`, 400);
      }

      if (!authData.user) {
        throw createError('Falha ao criar usuário', 400);
      }

      // Criar perfil do professor
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          nome,
          tipo: 'professor',
          especialidade: especialidadeFinal,
          telefone,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        // Se falhou criar o perfil, deletar o usuário do auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw createError(`Erro ao criar perfil: ${profileError.message}`, 400);
      }

      res.status(201).json({
        message: 'Professor registrado com sucesso',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nome,
          tipo: 'professor'
        }
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

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw createError(`Erro ao criar conta: ${authError.message}`, 400);
      }

      if (!authData.user) {
        throw createError('Falha ao criar usuário', 400);
      }

      // Criar perfil do aluno
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          nome,
          tipo: 'aluno',
          telefone,
          professor_id, // Pode ser null
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        // Se falhou criar o perfil, deletar o usuário do auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw createError(`Erro ao criar perfil: ${profileError.message}`, 400);
      }

      res.status(201).json({
        message: 'Aluno registrado com sucesso',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nome,
          tipo: 'aluno'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createError('Email e senha são obrigatórios', 400);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw createError('Credenciais inválidas', 401);
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: data.user.id,
          email: data.user.email,
          ...profile
        },
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      });
    } catch (error) {
      next(error);
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