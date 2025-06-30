import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tipo: 'professor' | 'aluno';
    role?: 'teacher' | 'student';
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw createError('Token de acesso requerido', 401);
    }

    // Verifica o token com Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw createError('Token inválido ou expirado', 401);
    }

    // Busca informações do usuário na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw createError('Perfil do usuário não encontrado', 401);
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      tipo: profile.user_type === 'teacher' ? 'professor' : 'aluno',
      role: profile.user_type
    };

    next();
  } catch (error: any) {
    console.error('Erro na autenticação:', error);
    next(createError('Erro na autenticação: ' + error.message, 401));
  }
};

export const requireRole = (roles: ('professor' | 'aluno')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Usuário não autenticado', 401));
    }

    if (!roles.includes(req.user.tipo)) {
      return next(createError('Acesso negado para este tipo de usuário', 403));
    }

    next();
  };
}; 