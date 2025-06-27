import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '@/config/supabase';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tipo: 'professor' | 'aluno';
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

    // Verifica o token com o Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw createError('Token inválido ou expirado', 401);
    }

    // Busca informações adicionais do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email!,
      tipo: profile?.tipo || 'aluno'
    };

    next();
  } catch (error) {
    next(error);
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