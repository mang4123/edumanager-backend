import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  type: 'teacher' | 'student';
  area?: string;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string, type: 'teacher' | 'student') => Promise<boolean>;
  register: (userData: Omit<UserProfile, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // DEBUG: Log estado atual
  const logCurrentState = () => {
    console.log('🔍 [DEBUG] AuthContext estado atual:', {
      hasUser: !!user,
      userName: user?.name,
      userType: user?.type,
      hasSession: !!session,
      loading: loading,
      sessionUserId: session?.user?.id
    });
  };

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true;
    console.log('🚀 [DEBUG] AuthContext: Inicializando...');

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log('⚠️ [DEBUG] Component desmontado, ignorando event:', event);
          return;
        }
        
        console.log('🔄 [DEBUG] Auth event:', event, 'User ID:', session?.user?.id);
        
        try {
          setSession(session);
          
          if (session?.user) {
            console.log('👤 [DEBUG] Usuário logado, criando perfil básico...');
            await createAndEnsureUserProfile(session.user);
            console.log('✅ [DEBUG] Perfil criado, definindo loading = false');
          } else {
            console.log('❌ [DEBUG] Sem usuário, limpando estado');
            setUser(null);
            console.log('✅ [DEBUG] Estado limpo, definindo loading = false');
          }
          
          setLoading(false);
          console.log('🎯 [DEBUG] Loading definido como FALSE após event:', event);
          
        } catch (error) {
          console.error('💥 [DEBUG] Erro no onAuthStateChange:', error);
          setLoading(false);
          console.log('🎯 [DEBUG] Loading definido como FALSE após erro');
        }
      }
    );

    // Verificar sessão existente
    const initAuth = async () => {
      try {
        console.log('🔍 [DEBUG] Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('⚠️ [DEBUG] Component desmontado durante init');
          return;
        }
        
        console.log('📋 [DEBUG] Sessão encontrada:', !!session, 'Erro:', error);
        
        setSession(session);
        
        if (session?.user) {
          console.log('👤 [DEBUG] Sessão existente, criando perfil básico...');
          await createAndEnsureUserProfile(session.user);
          console.log('✅ [DEBUG] Perfil existente criado, definindo loading = false');
        } else {
          console.log('❌ [DEBUG] Sem sessão existente');
          setUser(null);
          console.log('✅ [DEBUG] Sem sessão, definindo loading = false');
        }
        
        setLoading(false);
        console.log('🎯 [DEBUG] Loading definido como FALSE após init');
        
      } catch (error) {
        console.error('💥 [DEBUG] Erro ao inicializar auth:', error);
        if (mounted) {
          setLoading(false);
          console.log('🎯 [DEBUG] Loading definido como FALSE após erro init');
        }
      }
    };

    initAuth();

    return () => {
      console.log('🧹 [DEBUG] Cleanup AuthContext');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // DEBUG: Log sempre que loading mudar
  useEffect(() => {
    console.log('🔄 [DEBUG] Loading mudou para:', loading);
    logCurrentState();
  }, [loading]);

  // DEBUG: Log sempre que user mudar
  useEffect(() => {
    console.log('👤 [DEBUG] User mudou:', user?.name, user?.type);
    logCurrentState();
  }, [user]);

  const createAndEnsureUserProfile = async (authUser: User) => {
    console.log('🏗️ [DEBUG] INÍCIO createAndEnsureUserProfile para:', authUser.id);
    console.log('📧 [DEBUG] Email:', authUser.email);
    console.log('📱 [DEBUG] Metadata:', authUser.user_metadata);
    
    try {
      // Determinar tipo baseado no email ou metadata
      let userType: 'teacher' | 'student' = 'teacher'; // default
      
      if (authUser.user_metadata?.user_type) {
        userType = authUser.user_metadata.user_type;
      } else if (authUser.user_metadata?.type) {
        userType = authUser.user_metadata.type;
      } else if (authUser.email?.includes('aluno') || authUser.email?.includes('student')) {
        userType = 'student';
      }
      
      console.log('🎯 [DEBUG] Tipo determinado:', userType);
      
      const profile: UserProfile = {
        id: authUser.id,
        name: authUser.user_metadata?.name || 
              authUser.user_metadata?.full_name || 
              authUser.email?.split('@')[0] || 
              'Usuário',
        email: authUser.email || '',
        type: userType,
        phone: authUser.user_metadata?.phone,
        area: authUser.user_metadata?.area
      };
      
      console.log('✅ [DEBUG] Perfil básico criado:', profile);
      setUser(profile);
      console.log('🎯 [DEBUG] setUser() chamado com sucesso');

      // ✨ CORREÇÃO: Garantir que existe na tabela profiles para compatibilidade com backend
      try {
        console.log('🔍 [DEBUG] Verificando perfil na tabela profiles...');
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // Perfil não existe, criar um
          console.log('📝 [DEBUG] Criando perfil na tabela profiles...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              name: profile.name,
              email: profile.email,
              user_type: userType,
              phone: profile.phone
            });

          if (insertError) {
            console.error('❌ [DEBUG] Erro ao criar perfil:', insertError);
          } else {
            console.log('✅ [DEBUG] Perfil criado na tabela profiles');
          }
        } else if (!fetchError) {
          console.log('✅ [DEBUG] Perfil já existe na tabela profiles');
        } else {
          console.error('⚠️ [DEBUG] Erro ao verificar perfil:', fetchError);
        }
      } catch (profileError) {
        console.error('💥 [DEBUG] Erro ao verificar/criar perfil:', profileError);
      }

      console.log('🏁 [DEBUG] FIM createAndEnsureUserProfile - SUCESSO');
      
    } catch (error) {
      console.error('💥 [DEBUG] Erro geral em createAndEnsureUserProfile:', error);
      throw error; // Re-throw para ser capturado pelo caller
    }
  };

  const login = async (email: string, password: string, type: 'teacher' | 'student') => {
    try {
      console.log('🔐 [DEBUG] INÍCIO login para:', email, 'tipo:', type);
      setLoading(true);
      console.log('🎯 [DEBUG] Loading definido como TRUE para login');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ [DEBUG] Erro no login:', error);
        setLoading(false);
        console.log('🎯 [DEBUG] Loading definido como FALSE após erro login');
        return false;
      }

      console.log('✅ [DEBUG] Login bem-sucedido');
      // Loading será definido como false pelo onAuthStateChange
      console.log('⏳ [DEBUG] Aguardando onAuthStateChange definir loading=false');
      return !!data.user;
    } catch (error) {
      console.error('💥 [DEBUG] Erro no login:', error);
      setLoading(false);
      console.log('🎯 [DEBUG] Loading definido como FALSE após erro geral login');
      return false;
    }
  };

  const register = async (userData: Omit<UserProfile, 'id'> & { password: string }) => {
    try {
      console.log('📝 [DEBUG] INÍCIO registro para:', userData.email);
      setLoading(true);
      console.log('🎯 [DEBUG] Loading definido como TRUE para registro');
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData.name,
            user_type: userData.type,
            phone: userData.phone,
            area: userData.area
          }
        }
      });

      if (error) {
        console.error('❌ [DEBUG] Erro no registro:', error);
        setLoading(false);
        console.log('🎯 [DEBUG] Loading definido como FALSE após erro registro');
        return false;
      }

      console.log('✅ [DEBUG] Registro bem-sucedido');
      setLoading(false);
      console.log('🎯 [DEBUG] Loading definido como FALSE após registro');
      return !!data.user;
    } catch (error) {
      console.error('💥 [DEBUG] Erro no registro:', error);
      setLoading(false);
      console.log('🎯 [DEBUG] Loading definido como FALSE após erro geral registro');
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 [DEBUG] INÍCIO logout...');
      setLoading(true);
      console.log('🎯 [DEBUG] Loading definido como TRUE para logout');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ [DEBUG] Erro no logout:', error);
      }
      
      setUser(null);
      setSession(null);
      setLoading(false);
      console.log('✅ [DEBUG] Logout concluído, loading = false');
    } catch (error) {
      console.error('💥 [DEBUG] Erro no logout:', error);
      setLoading(false);
      console.log('🎯 [DEBUG] Loading definido como FALSE após erro logout');
    }
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!session,
    loading
  };

  console.log('🔄 [DEBUG] AuthProvider render, loading:', loading, 'user:', user?.name);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 