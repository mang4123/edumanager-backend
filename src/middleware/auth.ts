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

    // Verifica o token do Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw createError('Token inválido ou expirado', 401);
    }

    // Busca informações do usuário na tabela profiles
    console.log('Buscando perfil para usuário:', user.id, user.email || 'sem email');
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('Profile encontrado:', profile);
    console.log('Erro profile:', profileError);

    if (profileError || !profile) {
      // Criar perfil básico se não existir
      console.log('Criando perfil básico para:', user.id);
      const userEmail = user.email || 'user@example.com';
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email: userEmail,
          nome: userEmail.split('@')[0],
          tipo: 'professor'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
        throw createError('Perfil do usuário não encontrado e não foi possível criar', 401);
      }

      req.user = {
        id: newProfile.id,
        email: newProfile.email,
        tipo: 'professor',
        role: 'teacher'
      };
    } else {
      req.user = {
        id: profile.id,
        email: profile.email,
        tipo: profile.tipo === 'teacher' || profile.tipo === 'professor' ? 'professor' : 'aluno',
        role: profile.tipo === 'professor' ? 'teacher' : 'student'
      };
    }

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