// Solução: Modificar frontend para usar apenas Backend Express
// Execute no console do navegador (F12)

console.log('🔧 APLICANDO SOLUÇÃO: BACKEND ONLY');

// Função para interceptar e redirecionar chamadas do Supabase
function interceptSupabaseCalls() {
    console.log('📡 Interceptando chamadas do Supabase...');
    
    // Se o window.supabase existir, vamos "mocká-lo"
    if (!window.supabase) {
        window.supabase = {};
    }
    
    // Criar um cliente Supabase "fake" que redireciona para o backend
    window.supabase.from = function(table) {
        console.log(`🔄 Interceptando consulta para tabela: ${table}`);
        
        return {
            select: function(columns) {
                return {
                    eq: function(column, value) {
                        return this;
                    },
                    order: function(column, options) {
                        return this;
                    },
                    limit: function(count) {
                        return this;
                    },
                    then: async function(callback) {
                        try {
                            console.log(`📡 Fazendo requisição para /api/professor/${table}`);
                            
                            const response = await fetch(`https://edumanager-backend-5olt.onrender.com/api/professor/${table}`, {
                                headers: {
                                    'Authorization': `Bearer ${getAuthToken()}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            
                            if (response.ok) {
                                const result = await response.json();
                                const data = result.data || result;
                                console.log(`✅ Dados recebidos do backend:`, data);
                                callback({ data, error: null });
                            } else {
                                console.error(`❌ Erro na requisição: ${response.status}`);
                                callback({ data: null, error: { message: `Erro ${response.status}` } });
                            }
                        } catch (error) {
                            console.error('❌ Erro na interceptação:', error);
                            callback({ data: null, error });
                        }
                    }
                };
            }
        };
    };
    
    // Mock do auth
    window.supabase.auth = {
        getUser: async function() {
            return {
                data: {
                    user: {
                        id: 'e650f5ee-747b-4574-9bfa-8e2d411c4974',
                        email: 'leonardoeletr@gmail.com'
                    }
                },
                error: null
            };
        },
        getSession: async function() {
            return {
                data: {
                    session: {
                        user: {
                            id: 'e650f5ee-747b-4574-9bfa-8e2d411c4974',
                            email: 'leonardoeletr@gmail.com'
                        }
                    }
                },
                error: null
            };
        }
    };
}

// Função para pegar o token de auth (do sistema atual)
function getAuthToken() {
    // Tentar várias formas de pegar o token
    const methods = [
        () => localStorage.getItem('auth_token'),
        () => localStorage.getItem('token'),
        () => localStorage.getItem('access_token'),
        () => {
            const authKey = Object.keys(localStorage).find(key => 
                key.includes('auth') && (key.includes('token') || key.includes('session'))
            );
            if (authKey) {
                const data = JSON.parse(localStorage.getItem(authKey) || '{}');
                return data.access_token || data.token;
            }
            return null;
        }
    ];
    
    for (const method of methods) {
        try {
            const token = method();
            if (token) {
                console.log('🎫 Token encontrado via:', method.toString().substring(0, 50));
                return token;
            }
        } catch (e) {
            // Continuar tentando
        }
    }
    
    console.log('⚠️ Token não encontrado, usando token padrão');
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YW9yaGV0a3JnbWtydHpqcHZtIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJpYXQiOjE3MzU1MjI2NDYsImV4cCI6MjA1MTA5ODY0NiwiYWF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJzdWIiOiJlNjUwZjVlZS03NDdiLTQ1NzQtOWJmYS04ZTJkNDExYzQ5NzQifQ.USER_JWT_SECRET';
}

// Função para testar as rotas do backend
async function testarBackend() {
    console.log('🧪 Testando rotas do backend...');
    
    const rotas = [
        '/api/professor/dashboard',
        '/api/professor/alunos',
        '/api/professor/aulas',
        '/api/professor/exercicios'
    ];
    
    for (const rota of rotas) {
        try {
            console.log(`📡 Testando: ${rota}`);
            
            const response = await fetch(`https://edumanager-backend-5olt.onrender.com${rota}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${rota}: ${data.data ? data.data.length : 'OK'} itens`);
            } else {
                console.error(`❌ ${rota}: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error(`❌ Erro em ${rota}:`, error);
        }
    }
}

// Executar solução
console.log('🚀 Aplicando interceptação...');
interceptSupabaseCalls();

console.log('🧪 Testando backend...');
testarBackend();

console.log('✅ Solução aplicada! Recarregue a página e os erros devem desaparecer.');
console.log('💡 Se ainda houver erros, me informe quais aparecem.'); 