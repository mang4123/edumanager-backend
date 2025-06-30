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
      
      return {
        data: {
          session: {
            access_token: token,
            user: user,
          }
        },
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
      callback('SIGNED_IN', data.session);
    };

    checkAuth();

    return {
      data: {
        subscription: {
          unsubscribe: () => {}
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
}

class TableService {
  constructor(table) {
    this.table = table;
    this.query = {
      columns: '*',
      filters: [],
      orders: [],
      limits: null,
    };
  }

  // Substitui .select()
  select(columns = '*') {
    this.query.columns = columns;
    return this;
  }

  // Substitui .eq()
  eq(column, value) {
    this.query.filters.push({ type: 'eq', column, value });
    return this;
  }

  // Substitui .order()
  order(column, options = {}) {
    this.query.orders.push({ column, ...options });
    return this;
  }

  // Substitui .limit()
  limit(count) {
    this.query.limits = count;
    return this;
  }

  // Substitui .single()
  async single() {
    const result = await this.execute();
    if (result.error) return result;
    
    return {
      data: result.data?.[0] || null,
      error: result.data?.length === 0 ? { message: 'No rows found' } : null
    };
  }

  // Substitui .insert()
  async insert(data) {
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/${this.table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: { message: result.error } };
      }

      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Executa a query construída
  async execute() {
    const token = localStorage.getItem('auth_token');
    
    // Construir URL com query params
    const params = new URLSearchParams();
    
    if (this.query.columns !== '*') {
      params.append('select', this.query.columns);
    }
    
    this.query.filters.forEach(filter => {
      params.append(`${filter.column}`, `${filter.type}.${filter.value}`);
    });
    
    if (this.query.limits) {
      params.append('limit', this.query.limits);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/${this.table}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: { message: result.error } };
      }

      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Método padrão para buscar dados
  then(callback) {
    return this.execute().then(callback);
  }
}

// Exportar instância que substitui o supabase
export const supabase = new BackendClient();

// Para compatibilidade, também exportar como default
export default supabase; 