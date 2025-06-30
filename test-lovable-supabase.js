// Script para testar Supabase no contexto do Lovable
// Execute no console do navegador (F12)

console.log('🔍 TESTANDO SUPABASE NO LOVABLE');

// Primeiro, vamos verificar se existe um cliente Supabase
console.log('Verificando clientes Supabase disponíveis...');

// Tentar encontrar o cliente Supabase de várias formas
let supabaseClient = null;

// Verificar se está em window
if (typeof window !== 'undefined') {
    if (window.supabase) {
        supabaseClient = window.supabase;
        console.log('✅ Supabase encontrado em window.supabase');
    } else if (window.__SUPABASE_CLIENT__) {
        supabaseClient = window.__SUPABASE_CLIENT__;
        console.log('✅ Supabase encontrado em window.__SUPABASE_CLIENT__');
    }
}

// Se não encontrou, tentar acessar via módulos
if (!supabaseClient) {
    try {
        // Tentar acessar via React DevTools ou contexto
        const reactFiber = document.querySelector('#root')?._reactInternalFiber || 
                          document.querySelector('#root')?._reactInternals;
        
        if (reactFiber) {
            console.log('🔍 Tentando acessar via React internals...');
        }
    } catch (e) {
        console.log('React internals não acessíveis');
    }
}

// Verificar objetos globais
console.log('Objetos disponíveis no window:');
const windowKeys = Object.keys(window).filter(key => 
    key.toLowerCase().includes('supabase') || 
    key.toLowerCase().includes('client') ||
    key.toLowerCase().includes('db')
);
console.log('Chaves relacionadas:', windowKeys);

// Verificar se há dados de sessão
if (typeof localStorage !== 'undefined') {
    const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase')
    );
    console.log('Chaves Supabase no localStorage:', supabaseKeys);
    
    // Verificar sessão
    supabaseKeys.forEach(key => {
        if (key.includes('auth-token') || key.includes('session')) {
            console.log(`Sessão em ${key}:`, localStorage.getItem(key)?.substring(0, 50) + '...');
        }
    });
}

// Função para testar via fetch diretamente
async function testarViaFetch() {
    console.log('🔍 Testando via fetch direto...');
    
    try {
        // Tentar pegar token do localStorage
        let token = null;
        const authTokenKey = Object.keys(localStorage).find(key => 
            key.includes('supabase') && key.includes('auth-token')
        );
        
        if (authTokenKey) {
            const authData = JSON.parse(localStorage.getItem(authTokenKey) || '{}');
            token = authData.access_token;
        }
        
        if (token) {
            console.log('🎫 Token encontrado:', token.substring(0, 20) + '...');
            
            // Testar requisição direta para Supabase
            const response = await fetch('https://qyaorhetkrgmkrtzjpvm.supabase.co/rest/v1/aulas?select=*&limit=3', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YW9yaGV0a3JnbWtydHpqcHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MjI2NDYsImV4cCI6MjA1MTA5ODY0Nn0.OD4gV_Vei5I3AaYgHJNv6zz8pKVWXBLHt7ntvpk7Y30',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Dados de aulas via fetch:', data);
            } else {
                console.error('❌ Erro na requisição:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Detalhes do erro:', errorText);
            }
        } else {
            console.log('⚠️ Token não encontrado');
        }
        
    } catch (error) {
        console.error('❌ Erro no fetch:', error);
    }
}

// Função para verificar se tabelas existem
async function verificarTabelas() {
    console.log('🔍 Verificando se tabelas existem...');
    
    const tabelas = ['aulas', 'alunos', 'exercicios', 'profiles'];
    
    for (const tabela of tabelas) {
        try {
            const response = await fetch(`https://qyaorhetkrgmkrtzjpvm.supabase.co/rest/v1/${tabela}?select=*&limit=1`, {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YW9yaGV0a3JnbWtydHpqcHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MjI2NDYsImV4cCI6MjA1MTA5ODY0Nn0.OD4gV_Vei5I3AaYgHJNv6zz8pKVWXBLHt7ntvpk7Y30',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Tabela ${tabela} existe - ${data.length} registros (amostra)`);
            } else {
                console.error(`❌ Tabela ${tabela} não existe ou sem acesso:`, response.status);
            }
        } catch (error) {
            console.error(`❌ Erro ao verificar tabela ${tabela}:`, error);
        }
    }
}

// Executar testes
console.log('🚀 Iniciando testes...');
verificarTabelas();
testarViaFetch(); 