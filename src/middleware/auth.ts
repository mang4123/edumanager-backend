import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

    console.log('Token recebido:', token?.substring(0, 50) + '...');
    
    let userId: string;
    let userEmail: string;
    
    try {
      // Primeiro tenta como token do Supabase Lovable
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (user && !authError) {
        userId = user.id;
        userEmail = user.email || '';
        console.log('Token Supabase válido - User:', userId, userEmail);
      } else {
        // Se falhar, tenta decodificar como JWT direto (fallback)
        console.log('Tentando decodificar JWT direto...');
        const decoded = jwt.decode(token) as any;
        
        if (!decoded || !decoded.sub) {
          throw createError('Token inválido: não foi possível decodificar', 401);
        }
        
        userId = decoded.sub;
        userEmail = decoded.email || decoded.user_metadata?.email || '';
        console.log('JWT decodificado - User:', userId, userEmail);
      }
    } catch (jwtError: any) {
      console.error('Erro na validação do token:', jwtError.message);
      throw createError('Token inválido ou expirado: ' + jwtError.message, 401);
    }

    // Busca informações do usuário na tabela profiles usando o supabaseAdmin
    console.log('Buscando perfil para usuário:', userId);
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Profile encontrado:', profile);
    console.log('Erro profile:', profileError);

    if (profileError || !profile) {
      // Se não encontrar por ID, tenta por email
      if (userEmail) {
        console.log('Tentando buscar por email:', userEmail);
        const { data: profileByEmail, error: emailError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', userEmail)
          .single();
        
        if (profileByEmail && !emailError) {
          req.user = {
            id: profileByEmail.id,
            email: profileByEmail.email,
            tipo: profileByEmail.tipo === 'teacher' || profileByEmail.tipo === 'professor' ? 'professor' : 'aluno',
            role: profileByEmail.tipo === 'professor' ? 'teacher' : 'student'
          };
          return next();
        }
      }
      
      console.error('Perfil não encontrado para:', userId, userEmail);
      throw createError('Perfil do usuário não encontrado', 401);
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      tipo: profile.tipo === 'teacher' || profile.tipo === 'professor' ? 'professor' : 'aluno',
      role: profile.tipo === 'professor' ? 'teacher' : 'student'
    };

    console.log('Usuário autenticado:', req.user);
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