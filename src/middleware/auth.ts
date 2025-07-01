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

    // 🔥 CORREÇÃO: VERIFICAR CONVITES ANTES DE DETERMINAR TIPO
    // Determinar tipo baseado no email e metadata diretamente
    let userType: 'professor' | 'aluno' = 'professor'; // default
    let professorIdDoConvite = null;
    
    // 🎯 PRIMEIRO: VERIFICAR SE HÁ CONVITE PENDENTE (PRIORIDADE MÁXIMA)
    try {
      console.log('🔍 [AUTH] Verificando convites pendentes para:', userEmail);
      const { data: convitesPendentes } = await supabaseAdmin
        .from('convites')
        .select('professor_id, token, nome, id')
        .eq('email', userEmail)
        .eq('usado', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (convitesPendentes && convitesPendentes.length > 0) {
        professorIdDoConvite = convitesPendentes[0].professor_id;
        userType = 'aluno'; // SE TEM CONVITE, É ALUNO!
        console.log('🎉 [AUTH] CONVITE ENCONTRADO! Forçando tipo ALUNO. Professor:', professorIdDoConvite);
      } else {
        console.log('🔍 [AUTH] Nenhum convite encontrado, determinando tipo pelos metadados...');
        // Só então usar metadata para determinar tipo
        if (userMetadata.user_type) {
          userType = userMetadata.user_type === 'teacher' ? 'professor' : 'aluno';
        } else if (userMetadata.type) {
          userType = userMetadata.type === 'teacher' ? 'professor' : 'aluno';
        } else if (userEmail?.includes('aluno') || userEmail?.includes('student')) {
          userType = 'aluno';
        } else if (userEmail?.includes('prof') || userEmail?.includes('teacher')) {
          userType = 'professor';
        }
      }
    } catch (conviteError) {
      console.log('⚠️ [AUTH] Erro ao verificar convites (não crítico):', conviteError);
      // Fallback para metadata
      if (userMetadata.user_type) {
        userType = userMetadata.user_type === 'teacher' ? 'professor' : 'aluno';
      } else if (userMetadata.type) {
        userType = userMetadata.type === 'teacher' ? 'professor' : 'aluno';
      } else if (userEmail?.includes('aluno') || userEmail?.includes('student')) {
        userType = 'aluno';
      } else if (userEmail?.includes('prof') || userEmail?.includes('teacher')) {
        userType = 'professor';
      }
    }

    console.log('🎯 [AUTH] Tipo FINAL determinado:', userType, 'baseado em:', { 
      email: userEmail, 
      metadata_user_type: userMetadata.user_type,
      metadata_type: userMetadata.type,
      tem_convite: !!professorIdDoConvite,
      professor_do_convite: professorIdDoConvite
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
        
        // 🎯 CORREÇÃO AUTOMÁTICA: Se tem convite pendente mas perfil está como professor, corrigir!
        if (professorIdDoConvite && profile.tipo === 'professor') {
          console.log('🔧 [AUTH] CORREÇÃO AUTOMÁTICA: Perfil é professor mas tem convite pendente. Convertendo para aluno...');
          
          const { data: perfilCorrigido, error: correcaoError } = await supabaseAdmin
            .from('profiles')
            .update({
              tipo: 'aluno',
              user_type: 'aluno',
              professor_id: professorIdDoConvite,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

          if (correcaoError) {
            console.error('❌ [AUTH] Erro na correção automática:', correcaoError);
          } else {
            console.log('✅ [AUTH] Perfil corrigido automaticamente:', perfilCorrigido);
            profileData = perfilCorrigido;
            userType = 'aluno';
            
            // Criar relacionamento na tabela alunos
            try {
              const { data: relacionamento, error: relError } = await supabaseAdmin
                .from('alunos')
                .upsert({
                  aluno_id: userId,
                  professor_id: professorIdDoConvite,
                  ativo: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();

              if (relError) {
                console.error('❌ [AUTH] Erro ao criar relacionamento na correção:', relError);
              } else {
                console.log('✅ [AUTH] Relacionamento criado na correção automática:', relacionamento);
              }

              // Marcar convite como usado
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

              console.log('🎉 [AUTH] CORREÇÃO AUTOMÁTICA CONCLUÍDA COM SUCESSO!');
            } catch (relacionamentoError) {
              console.error('⚠️ [AUTH] Erro no relacionamento da correção:', relacionamentoError);
            }
          }
        } else {
          // Se encontrar na tabela, usar os dados de lá normalmente
          userType = profile.user_type === 'teacher' || profile.user_type === 'professor' || profile.tipo === 'professor' ? 'professor' : 'aluno';
        }
      } else {
        console.log('⚠️ [AUTH] Perfil não encontrado, criando automaticamente...');
        
        // CRIAR PERFIL AUTOMATICAMENTE (com vinculação se houver convite)
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            nome: userMetadata.name || userEmail.split('@')[0] || (userType === 'professor' ? 'Professor' : 'Aluno'),
            email: userEmail,
            tipo: userType,
            user_type: userType,
            professor_id: professorIdDoConvite, // 🎯 VINCULAÇÃO AUTOMÁTICA VIA CONVITE!
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
          if (professorIdDoConvite && userType === 'aluno') {
            try {
              const { data: relacionamento, error: relError } = await supabaseAdmin
                .from('alunos')
                .insert({
                  aluno_id: userId,
                  professor_id: professorIdDoConvite,
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