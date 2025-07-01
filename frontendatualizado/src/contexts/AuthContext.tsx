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

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true;
    console.log('🚀 AuthContext: Inicializando (VERSÃO SEM PROFILES)...');

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth event:', event, 'User ID:', session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          console.log('👤 Usuário logado, criando perfil básico...');
          await createAndEnsureUserProfile(session.user);
        } else {
          console.log('❌ Sem usuário, limpando estado');
          setUser(null);
        }
        
        console.log('✅ Definindo loading como false');
        setLoading(false);
      }
    );

    // Verificar sessão existente
    const initAuth = async () => {
      try {
        console.log('🔍 Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('📋 Sessão encontrada:', !!session, 'Erro:', error);
        setSession(session);
        
        if (session?.user) {
          console.log('👤 Sessão existente, criando perfil básico...');
          await createAndEnsureUserProfile(session.user);
        } else {
          console.log('❌ Sem sessão');
          setUser(null);
        }
        
        console.log('✅ Definindo loading como false (init)');
        setLoading(false);
        
      } catch (error) {
        console.error('💥 Erro ao inicializar auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const createAndEnsureUserProfile = async (authUser: User) => {
    console.log('🏗️ Criando perfil básico para:', authUser.id);
    console.log('📧 Email:', authUser.email);
    console.log('📱 Metadata:', authUser.user_metadata);
    
    // Determinar tipo baseado no email ou metadata
    let userType: 'teacher' | 'student' = 'teacher'; // default
    
    if (authUser.user_metadata?.user_type) {
      userType = authUser.user_metadata.user_type;
    } else if (authUser.email?.includes('aluno') || authUser.email?.includes('student')) {
      userType = 'student';
    }
    
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
    setUser(profile);

    // ✨ CORREÇÃO: Garantir que existe na tabela profiles para compatibilidade com backend
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Perfil não existe, criar um
        console.log('📝 Criando perfil na tabela profiles...');
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
          console.error('❌ Erro ao criar perfil:', insertError);
        } else {
          console.log('✅ Perfil criado na tabela profiles');
        }
      } else if (!fetchError) {
        console.log('✅ Perfil já existe na tabela profiles');
      }
    } catch (error) {
      console.error('💥 Erro ao verificar/criar perfil:', error);
    }
  };

  const login = async (email: string, password: string, type: 'teacher' | 'student') => {
    try {
      console.log('🔐 Iniciando login para:', email, 'tipo:', type);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        setLoading(false);
        return false;
      }

      console.log('✅ Login bem-sucedido');
      // Loading será definido como false pelo onAuthStateChange
      return !!data.user;
    } catch (error) {
      console.error('💥 Erro no login:', error);
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: Omit<UserProfile, 'id'> & { password: string }) => {
    try {
      console.log('📝 Iniciando registro para:', userData.email);
      setLoading(true);
      
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
        setLoading(false);
        return false;
      }

      console.log('✅ Registro bem-sucedido');
      setLoading(false);
      return !!data.user;
    } catch (error) {
      console.error('💥 Erro no registro:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error);
      }
      
      setUser(null);
      setSession(null);
      console.log('✅ Logout bem-sucedido');
      setLoading(false);
    } catch (error) {
      console.error('💥 Erro no logout:', error);
      setLoading(false);
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