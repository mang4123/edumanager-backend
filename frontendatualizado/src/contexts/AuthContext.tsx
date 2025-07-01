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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, type: 'teacher' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Criar perfil básico do usuário
  const createAndEnsureUserProfile = async (authUser: User) => {
    console.log('🏗️ Criando perfil básico para:', authUser.id);
    console.log('📧 Email:', authUser.email);
    console.log('📱 Metadata:', authUser.user_metadata);

    const basicProfile: UserProfile = {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
      email: authUser.email || '',
      type: authUser.user_metadata?.type || 'student'
    };

    // Criar ou atualizar perfil no Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.id,
        nome: basicProfile.name,
        email: basicProfile.email,
        tipo: basicProfile.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar/atualizar perfil:', error);
    } else {
      console.log('✅ Perfil criado/atualizado no Supabase:', profile);
    }

    setUser(basicProfile);
    console.log('✅ [CORRIGIDO] Definindo loading como false');
  };

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true;
    console.log('🚀 AuthContext: Inicializando (VERSÃO CORRIGIDA)...');

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
        
        console.log('✅ [CORRIGIDO] Definindo loading como false');
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
          console.log('✅ [CORRIGIDO] Definindo loading como false (init)');
        } else {
          console.log('❌ Sem sessão');
          setUser(null);
        }
        
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

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, type: 'teacher' | 'student') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            type
          }
        }
      });

      if (error) throw error;

    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
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

export default AuthContext;