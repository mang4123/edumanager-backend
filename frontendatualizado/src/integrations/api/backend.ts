
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'https://edumanager-backend-5olt.onrender.com';

export class BackendAPI {
  private async getAuthToken() {
    console.log('🔑 getAuthToken() chamada');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('📝 Session exists:', !!session);
    console.log('📝 Session user:', session?.user?.id || 'No user');
    console.log('📝 Access token exists:', !!session?.access_token);
    
    if (error) {
      console.error('❌ Erro ao obter sessão:', error);
      return null;
    }
    
    if (!session) {
      console.warn('⚠️ Nenhuma sessão ativa encontrada');
      return null;
    }
    
    if (!session.access_token) {
      console.warn('⚠️ Access token não encontrado na sessão');
      return null;
    }
    
    // Log apenas os primeiros e últimos caracteres do token por segurança
    const tokenPreview = session.access_token.substring(0, 10) + '...' + session.access_token.substring(session.access_token.length - 10);
    console.log('🎫 Token preview:', tokenPreview);
    
    return session.access_token;
  }

  async get(endpoint: string) {
    console.log(`🌐 GET request to: ${endpoint}`);
    
    const token = await this.getAuthToken();
    
    if (!token) {
      console.error('❌ Token não disponível para requisição GET');
      throw new Error('Token de autenticação não disponível');
    }
    
    console.log('📤 Enviando requisição GET com token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('🚫 Token inválido ou expirado (401)');
      } else if (response.status === 403) {
        console.error('🚫 Acesso negado (403)');
      }
      
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ GET response received:', typeof data, Array.isArray(data) ? `Array with ${data.length} items` : 'Object');
    
    return data;
  }

  async post(endpoint: string, data: any) {
    console.log(`🌐 POST request to: ${endpoint}`);
    
    const token = await this.getAuthToken();
    
    if (!token) {
      console.error('❌ Token não disponível para requisição POST');
      throw new Error('Token de autenticação não disponível');
    }
    
    console.log('📤 Enviando requisição POST com token');
    console.log('📝 POST data:', data);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('🚫 Token inválido ou expirado (401)');
      } else if (response.status === 403) {
        console.error('🚫 Acesso negado (403)');
      }
      
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('✅ POST response received:', typeof responseData);
    
    return responseData;
  }
}

export const backendAPI = new BackendAPI();
