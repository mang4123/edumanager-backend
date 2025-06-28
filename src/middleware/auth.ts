import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
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

    // Verifica o JWT próprio (não usa mais Supabase Auth)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    if (!decoded || !decoded.userId || !decoded.email) {
      throw createError('Token inválido ou expirado', 401);
    }

    // Busca informações do usuário na tabela profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !profile) {
      throw createError('Usuário não encontrado', 401);
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      tipo: profile.tipo
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createError('Token inválido ou expirado', 401));
    } else {
      next(error);
    }
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