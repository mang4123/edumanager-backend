import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
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

  // DEBUG: Monitor loading changes
  useEffect(() => {
    console.log('🔄 [DEBUG] Loading mudou para:', loading);
  }, [loading]);

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true;
    console.log('🚀 AuthContext: Inicializando (VERSÃO SEM PROFILES)...');

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log('⚠️ [DEBUG] Component desmontado, ignorando event:', event);
          return;
        }
        
        console.log('🔄 Auth event:', event, 'User ID:', session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          console.log('👤 Usuário logado, criando perfil básico...');
          try {
            await createAndEnsureUserProfile(session.user);
            console.log('✅ [DEBUG] createAndEnsureUserProfile concluído com SUCESSO');
          } catch (error) {
            console.error('💥 [DEBUG] Erro em createAndEnsureUserProfile:', error);
          }
        } else {
          console.log('❌ Sem usuário, limpando estado');
          setUser(null);
        }
        
        console.log('✅ [DEBUG] Prestes a definir loading como false (onAuthStateChange)');
        setLoading(false);
        console.log('🎯 [DEBUG] setLoading(false) foi chamado (onAuthStateChange)');
      }
    );

    // Verificar sessão existente
    const initAuth = async () => {
      try {
        console.log('🔍 Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('⚠️ [DEBUG] Component desmontado durante init');
          return;
        }
        
        console.log('📋 Sessão encontrada:', !!session, 'Erro:', error);
        setSession(session);
        
        if (session?.user) {
          console.log('👤 Sessão existente, criando perfil básico...');
          try {
            await createAndEnsureUserProfile(session.user);
            console.log('✅ [DEBUG] createAndEnsureUserProfile (init) concluído com SUCESSO');
          } catch (error) {
            console.error('💥 [DEBUG] Erro em createAndEnsureUserProfile (init):', error);
          }
        } else {
          console.log('❌ Sem sessão');
          setUser(null);
        }
        
        console.log('✅ [DEBUG] Prestes a definir loading como false (init)');
        setLoading(false);
        console.log('🎯 [DEBUG] setLoading(false) foi chamado (init)');
        
      } catch (error) {
        console.error('💥 Erro ao inicializar auth:', error);
        if (mounted) {
          console.log('✅ [DEBUG] Prestes a definir loading como false (erro init)');
          setLoading(false);
          console.log('🎯 [DEBUG] setLoading(false) foi chamado (erro init)');
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

  const createAndEnsureUserProfile = async (authUser: User) => {
    console.log('🏗️ [DEBUG] INÍCIO createAndEnsureUserProfile para:', authUser.id);
    console.log('📧 Email:', authUser.email);
    console.log('📱 Metadata:', authUser.user_metadata);
    
    try {
      // Determinar tipo baseado no email ou metadata
      let userType: 'teacher' | 'student' = 'teacher'; // default
      
      if (authUser.user_metadata?.user_type) {
        userType = authUser.user_metadata.user_type;
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
      
      console.log('✅ Perfil básico criado:', profile);
      console.log('🎯 [DEBUG] Prestes a chamar setUser()');
      setUser(profile);
      console.log('✅ [DEBUG] setUser() chamado com sucesso');

      // ✨ CORREÇÃO: REMOVIDA a verificação problemática da tabela profiles
      console.log('⚠️ [DEBUG] Pulando verificação da tabela profiles (causa do travamento)');
      console.log('ℹ️ [DEBUG] Sistema funcionará sem sync com tabela profiles');

      console.log('🏁 [DEBUG] FIM createAndEnsureUserProfile - SUCESSO TOTAL');

    } catch (error) {
      console.error('💥 [DEBUG] Exception geral em createAndEnsureUserProfile:', error);
      throw error; // Manter o comportamento original
    }
  };

  const login = async (email: string, password: string, type: 'teacher' | 'student') => {
    try {
      console.log('🔐 Iniciando login para:', email, 'tipo:', type);
      console.log('🎯 [DEBUG] Prestes a definir loading como true (login)');
      setLoading(true);
      console.log('✅ [DEBUG] setLoading(true) chamado (login)');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        console.log('🎯 [DEBUG] Prestes a definir loading como false (erro login)');
        setLoading(false);
        console.log('✅ [DEBUG] setLoading(false) chamado (erro login)');
        return false;
      }

      console.log('✅ Login bem-sucedido');
      // Loading será definido como false pelo onAuthStateChange
      console.log('⏳ [DEBUG] Aguardando onAuthStateChange definir loading=false');
      return !!data.user;
    } catch (error) {
      console.error('💥 Erro no login:', error);
      console.log('🎯 [DEBUG] Prestes a definir loading como false (exception login)');
      setLoading(false);
      console.log('✅ [DEBUG] setLoading(false) chamado (exception login)');
      return false;
    }
  };

  const register = async (userData: Omit<UserProfile, 'id'> & { password: string }) => {
    try {
      console.log('📝 Iniciando registro para:', userData.email);
      console.log('🎯 [DEBUG] Prestes a definir loading como true (register)');
      setLoading(true);
      console.log('✅ [DEBUG] setLoading(true) chamado (register)');
      
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
        console.error('❌ Erro no registro:', error);
        console.log('🎯 [DEBUG] Prestes a definir loading como false (erro register)');
        setLoading(false);
        console.log('✅ [DEBUG] setLoading(false) chamado (erro register)');
        return false;
      }

      console.log('✅ Registro bem-sucedido');
      console.log('🎯 [DEBUG] Prestes a definir loading como false (sucesso register)');
      setLoading(false);
      console.log('✅ [DEBUG] setLoading(false) chamado (sucesso register)');
      return !!data.user;
    } catch (error) {
      console.error('💥 Erro no registro:', error);
      console.log('🎯 [DEBUG] Prestes a definir loading como false (exception register)');
      setLoading(false);
      console.log('✅ [DEBUG] setLoading(false) chamado (exception register)');
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      console.log('🎯 [DEBUG] Prestes a definir loading como true (logout)');
      setLoading(true);
      console.log('✅ [DEBUG] setLoading(true) chamado (logout)');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error);
      }
      
      setUser(null);
      setSession(null);
      console.log('✅ Logout bem-sucedido');
      console.log('🎯 [DEBUG] Prestes a definir loading como false (logout)');
      setLoading(false);
      console.log('✅ [DEBUG] setLoading(false) chamado (logout)');
    } catch (error) {
      console.error('💥 Erro no logout:', error);
      console.log('🎯 [DEBUG] Prestes a definir loading como false (exception logout)');
      setLoading(false);
      console.log('✅ [DEBUG] setLoading(false) chamado (exception logout)');
    }
  };

  console.log('🔍 AuthContext estado atual:', { 
    hasUser: !!user, 
    userName: user?.name,
    userType: user?.type,
    hasSession: !!session, 
    loading, 
    isAuthenticated: !!session 
  });

  return (
    <AuthContext.Provider value={{
      user,
      session,
      login,
      register,
      logout,
      isAuthenticated: !!session,
      loading
    }}>
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