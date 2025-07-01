// Adaptador para substituir Supabase por chamadas ao backend Express
// Arquivo: src/integrations/api/client.ts

const API_BASE_URL = 'https://edumanager-backend-5olt.onrender.com';

// Classe que simula interface do Supabase mas usa nosso backend
class BackendClient {
  constructor() {
    this.auth = new AuthService();
  }

  // Simula supabase.from('tabela')
  from(table) {
    return new TableService(table);
  }
}

class AuthService {
  constructor() {
    this._session = null;
  }

  // Substitui supabase.auth.signUp()
  async signUp({ email, password, options = {} }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: options.data?.name,
          type: options.data?.user_type || 'teacher',
          area: options.data?.area,
          phone: options.data?.phone,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: { message: result.error } };
      }

      // Simular estrutura de resposta do Supabase
      return {
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
          },
          session: {
            access_token: result.token,
            user: result.user,
          }
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Substitui supabase.auth.signInWithPassword()
  async signInWithPassword({ email, password }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: { message: result.error } };
      }

      // Salvar token no localStorage
      localStorage.setItem('auth_token', result.token);

      return {
        data: {
          user: result.user,
          session: {
            access_token: result.token,
            user: result.user,
          }
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Substitui supabase.auth.signOut()
  async signOut() {
    localStorage.removeItem('auth_token');
    return { error: null };
  }

  // Substitui supabase.auth.getSession()
  async getSession() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return { data: { session: null }, error: null };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('auth_token');
        return { data: { session: null }, error: null };
      }

      const user = await response.json();
      this._session = {
        access_token: token,
        user: user,
        expires_at: Date.now() + 3600000 // 1 hora
      };
      
      return {
        data: { session: this._session },
        error: null
      };
    } catch (error) {
      return { data: { session: null }, error: { message: error.message } };
    }
  }

  // Observer de mudanças de auth
  onAuthStateChange(callback) {
    // Implementar listener básico
    const checkAuth = async () => {
      const { data } = await this.getSession();
      if (data.session) {
        callback('SIGNED_IN', data.session);
      } else {
        callback('SIGNED_OUT', null);
      }
    };

    // Verificar a cada 5 minutos
    const interval = setInterval(checkAuth, 300000);
    checkAuth();

    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval)
        }
      }
    };
  }

  // Substitui supabase.auth.getUser()
  async getUser(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { data: { user: null }, error: { message: 'Invalid token' } };
      }

      const user = await response.json();
      return { data: { user }, error: null };
    } catch (error) {
      return { data: { user: null }, error: { message: error.message } };
    }
  }

  // Método para compatibilidade com v2
  session() {
    return this._session;
  }
}

class TableService {
  constructor(table) {
    this.table = table;
  }

  async select(columns = '*') {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/${this.table}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return { data: data.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insert(values) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/${this.table}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      return { data: data.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Exportar instância que substitui o supabase
export const supabase = new BackendClient();

// Para compatibilidade, também exportar como default
export default supabase; 