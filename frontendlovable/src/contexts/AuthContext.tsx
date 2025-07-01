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
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Buscar perfil do usuário SEM setTimeout
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Query SIMPLES sem JOIN problemático
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, nome, email, user_type, telefone')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        setLoading(false);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.nome || profile.email,
          email: profile.email,
          type: profile.user_type as 'teacher' | 'student',
          phone: profile.telefone
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, type: 'teacher' | 'student') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const register = async (userData: Omit<UserProfile, 'id'> & { password: string }) => {
    try {
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
        console.error('Erro no registro:', error);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

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
