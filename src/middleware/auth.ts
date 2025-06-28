import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../config/supabase';
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

    console.log('=== AUTH MIDDLEWARE ===');
    console.log('URL:', req.url);
    console.log('Token header:', authHeader ? 'Present' : 'Missing');

    if (!token) {
      throw createError('Token de acesso requerido', 401);
    }

    // Verifica o JWT próprio (não usa mais Supabase Auth)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    console.log('Token decoded:', { userId: decoded.userId, email: decoded.email, tipo: decoded.tipo });

    if (!decoded || !decoded.userId || !decoded.email) {
      throw createError('Token inválido ou expirado', 401);
    }

    // Busca informações do usuário na tabela profiles usando admin client
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    console.log('Profile query result:', { 
      profile: profile ? 'Found' : 'Not found', 
      error: error ? error.message : null,
      userId: decoded.userId 
    });

    if (error || !profile) {
      console.log('Profile error details:', error);
      throw createError('Usuário não encontrado', 401);
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      tipo: profile.tipo
    };

    console.log('Auth successful for user:', profile.email);
    console.log('=== FIM AUTH MIDDLEWARE ===');
    next();
  } catch (error: any) {
    console.log('Auth error:', error.message);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createError('Token inválido ou expirado', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: ('professor' | 'aluno')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('=== REQUIRE ROLE CHECK ===');
    console.log('URL:', req.url);
    console.log('Required roles:', roles);
    console.log('User:', req.user);
    
    if (!req.user) {
      console.log('❌ REQUIRE ROLE: Usuário não autenticado');
      return next(createError('Usuário não autenticado', 401));
    }

    if (!roles.includes(req.user.tipo)) {
      console.log('❌ REQUIRE ROLE: Acesso negado');
      console.log('User tipo:', req.user.tipo);
      console.log('Required roles:', roles);
      return next(createError('Acesso negado para este tipo de usuário', 403));
    }

    console.log('✅ REQUIRE ROLE: Acesso autorizado');
    console.log('=== FIM REQUIRE ROLE ===');
    next();
  };
}; 