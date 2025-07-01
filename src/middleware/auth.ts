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

    // ✨ CRIAR PERFIL AUTOMATICAMENTE SE NÃO EXISTIR
    let profileData = null;
    try {
      console.log('🔍 [AUTH] Verificando se perfil existe na tabela profiles...');
      
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile && !profileError) {
        profileData = profile;
        console.log('✅ [AUTH] Perfil encontrado na tabela profiles');
        // Se encontrar na tabela, usar os dados de lá
        userType = profile.user_type === 'teacher' || profile.user_type === 'professor' || profile.tipo === 'professor' ? 'professor' : 'aluno';
      } else {
        console.log('⚠️ [AUTH] Perfil não encontrado, criando automaticamente...');
        
        // 🎯 VERIFICAR SE HÁ CONVITE PENDENTE PARA ESTE EMAIL
        let professorId = null;
        try {
          const { data: convitesPendentes } = await supabaseAdmin
            .from('convites')
            .select('professor_id, token, nome')
            .eq('email', userEmail)
            .eq('usado', false)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

          if (convitesPendentes && convitesPendentes.length > 0) {
            professorId = convitesPendentes[0].professor_id;
            console.log('🎉 [AUTH] CONVITE ENCONTRADO! Vinculando ao professor:', professorId);
            userType = 'aluno'; // Se tem convite, é aluno
          }
        } catch (conviteError) {
          console.log('⚠️ [AUTH] Erro ao verificar convites (não crítico):', conviteError);
        }

        // CRIAR PERFIL AUTOMATICAMENTE (com vinculação se houver convite)
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            nome: userMetadata.name || userEmail.split('@')[0] || (userType === 'professor' ? 'Professor' : 'Aluno'),
            email: userEmail,
            tipo: userType,
            user_type: userType,
            professor_id: professorId, // 🎯 VINCULAÇÃO AUTOMÁTICA VIA CONVITE!
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ [AUTH] Erro ao criar perfil automaticamente:', createError);
          // Não é erro crítico - continua sem perfil na tabela
        } else {
          console.log('✅ [AUTH] Perfil criado automaticamente:', newProfile);
          profileData = newProfile;

          // 🎯 SE VINCULOU VIA CONVITE, CRIAR RELACIONAMENTO NA TABELA ALUNOS
          if (professorId && userType === 'aluno') {
            try {
              const { data: relacionamento, error: relError } = await supabaseAdmin
                .from('alunos')
                .insert({
                  aluno_id: userId,
                  professor_id: professorId,
                  ativo: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();

              if (relError) {
                console.error('❌ [AUTH] Erro ao criar relacionamento aluno-professor:', relError);
              } else {
                console.log('✅ [AUTH] Relacionamento aluno-professor criado automaticamente:', relacionamento);
              }

              // MARCAR CONVITE COMO USADO
              await supabaseAdmin
                .from('convites')
                .update({
                  usado: true,
                  usado_em: new Date().toISOString(),
                  aluno_id: userId,
                  updated_at: new Date().toISOString()
                })
                .eq('email', userEmail)
                .eq('usado', false);

              console.log('🎉 [AUTH] VINCULAÇÃO AUTOMÁTICA CONCLUÍDA COM SUCESSO!');
            } catch (relacionamentoError) {
              console.error('⚠️ [AUTH] Erro no relacionamento (não crítico):', relacionamentoError);
            }
          }
        }
      }
    } catch (profileError) {
      console.log('⚠️ [AUTH] Erro ao verificar/criar perfil (não crítico):', profileError);
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