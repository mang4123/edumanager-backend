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
    nome?: string;
    telefone?: string;
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

    console.log('🔐 [AUTH] Token recebido:', token?.substring(0, 50) + '...');
    
    let userId: string;
    let userEmail: string;
    let userMetadata: any = {};
    
    try {
      // Primeiro tenta como token do Supabase
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (user && !authError) {
        userId = user.id;
        userEmail = user.email || '';
        userMetadata = user.user_metadata || {};
        console.log('✅ [AUTH] Token Supabase válido - User:', userId, userEmail);
      } else {
        // Se falhar, tenta decodificar como JWT direto (fallback)
        console.log('🔄 [AUTH] Tentando decodificar JWT direto...');
        const decoded = jwt.decode(token) as any;
        
        if (!decoded || !decoded.sub) {
          throw createError('Token inválido: não foi possível decodificar', 401);
        }
        
        userId = decoded.sub;
        userEmail = decoded.email || decoded.user_metadata?.email || '';
        userMetadata = decoded.user_metadata || {};
        console.log('✅ [AUTH] JWT decodificado - User:', userId, userEmail);
      }
    } catch (jwtError: any) {
      console.error('❌ [AUTH] Erro na validação do token:', jwtError.message);
      throw createError('Token inválido ou expirado: ' + jwtError.message, 401);
    }

    // 🔥 CORREÇÃO: NÃO DEPENDER da tabela profiles
    // Determinar tipo baseado no email e metadata diretamente
    let userType: 'professor' | 'aluno' = 'professor'; // default
    
    if (userMetadata.user_type) {
      userType = userMetadata.user_type === 'teacher' ? 'professor' : 'aluno';
    } else if (userMetadata.type) {
      userType = userMetadata.type === 'teacher' ? 'professor' : 'aluno';
    } else if (userEmail?.includes('aluno') || userEmail?.includes('student')) {
      userType = 'aluno';
    } else if (userEmail?.includes('prof') || userEmail?.includes('teacher')) {
      userType = 'professor';
    }

    console.log('🎯 [AUTH] Tipo determinado:', userType, 'baseado em:', { 
      email: userEmail, 
      metadata_user_type: userMetadata.user_type,
      metadata_type: userMetadata.type 
    });

    // ✨ TENTATIVA DE BUSCAR NA TABELA PROFILES (mas não é obrigatório)
    let profileData = null;
    try {
      console.log('🔍 [AUTH] Tentando buscar perfil na tabela profiles...');
      
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile && !profileError) {
        profileData = profile;
        console.log('✅ [AUTH] Perfil encontrado na tabela profiles');
        // Se encontrar na tabela, usar os dados de lá
        userType = profile.user_type === 'teacher' || profile.user_type === 'professor' ? 'professor' : 'aluno';
      } else {
        console.log('⚠️ [AUTH] Perfil não encontrado na tabela profiles, usando dados do token');
      }
    } catch (profileError) {
      console.log('⚠️ [AUTH] Erro ao buscar perfil (não crítico):', profileError);
      // Não é erro crítico - continua com dados do token
    }

    // Montar objeto user com dados disponíveis
    req.user = {
      id: userId,
      email: userEmail,
      tipo: userType,
      role: userType === 'professor' ? 'teacher' : 'student',
      nome: profileData?.nome || userMetadata.name || userEmail.split('@')[0],
      telefone: profileData?.telefone || userMetadata.phone
    };

    console.log('✅ [AUTH] Usuário autenticado:', {
      id: req.user.id,
      email: req.user.email,
      tipo: req.user.tipo,
      role: req.user.role,
      fonte: profileData ? 'profiles_table' : 'token_metadata'
    });

    next();
  } catch (error: any) {
    console.error('💥 [AUTH] Erro na autenticação:', error);
    next(createError('Erro na autenticação: ' + error.message, 401));
  }
};

export const requireRole = (roles: ('professor' | 'aluno')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.error('❌ [ROLE] Usuário não autenticado');
      return next(createError('Usuário não autenticado', 401));
    }

    if (!roles.includes(req.user.tipo)) {
      console.error('❌ [ROLE] Acesso negado:', {
        userTipo: req.user.tipo,
        rolesPermitidos: roles,
        userId: req.user.id
      });
      return next(createError(`Acesso negado. Necessário: ${roles.join(' ou ')}. Usuário é: ${req.user.tipo}`, 403));
    }

    console.log('✅ [ROLE] Acesso permitido:', {
      userTipo: req.user.tipo,
      rolesPermitidos: roles,
      userId: req.user.id
    });

    next();
  };
}; 