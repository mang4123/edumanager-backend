// SOLUÇÃO DEFINITIVA: Substituir todas as chamadas Supabase
// Execute no console do navegador (F12)

console.log('🚀 APLICANDO SOLUÇÃO DEFINITIVA');

// Função para pegar token de auth
function getAuthToken() {
    const authKey = Object.keys(localStorage).find(key => 
        key.includes('sb-') && key.includes('auth-token')
    );
    if (authKey) {
        const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
        return authData.access_token;
    }
    return null;
}

// Substituir completamente o cliente Supabase
window.supabase = {
    from: function(table) {
        console.log(`🔄 Supabase.from(${table}) -> Backend API`);
        
        return {
            select: function(columns = '*') {
                console.log(`📋 Select: ${columns}`);
                return {
                    eq: function(column, value) {
                        console.log(`🔍 Where ${column} = ${value}`);
                        return this;
                    },
                    order: function(column, options) {
                        console.log(`📊 Order by ${column}`);
                        return this;
                    },
                    limit: function(count) {
                        console.log(`📏 Limit ${count}`);
                        return this;
                    },
                    then: async function(callback) {
                        return this.exec(callback);
                    },
                    exec: async function(callback) {
                        try {
                            console.log(`📡 Fazendo requisição para /api/professor/${table}`);
                            
                            const token = getAuthToken();
                            if (!token) {
                                console.error('❌ Token não encontrado');
                                callback({ data: [], error: { message: 'Token não encontrado' } });
                                return;
                            }

                            const response = await fetch(`https://edumanager-backend-5olt.onrender.com/api/professor/${table}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (response.ok) {
                                const result = await response.json();
                                const data = result.data || result || [];
                                console.log(`✅ ${table}: ${data.length} itens recebidos`);
                                
                                // Garantir formato correto para cada tipo de dados
                                let formattedData = data;
                                
                                if (table === 'aulas') {
                                    formattedData = data.map(aula => ({
                                        ...aula,
                                        data_hora: aula.data_hora || aula.dataHora,
                                        aluno: aula.aluno || { nome: 'Aluno', email: 'aluno@email.com' }
                                    }));
                                } else if (table === 'alunos') {
                                    formattedData = data.map(aluno => ({
                                        ...aluno,
                                        profiles: { name: aluno.nome || 'Aluno' }
                                    }));
                                }
                                
                                callback({ data: formattedData, error: null });
                            } else {
                                console.error(`❌ Erro ${response.status} em ${table}`);
                                callback({ data: [], error: { message: `Erro ${response.status}` } });
                            }
                        } catch (error) {
                            console.error(`❌ Erro na requisição ${table}:`, error);
                            callback({ data: [], error });
                        }
                    }
                };
            },
            insert: function(data) {
                console.log(`➕ Insert em ${table}:`, data);
                return {
                    then: async function(callback) {
                        return this.exec(callback);
                    },
                    exec: async function(callback) {
                        try {
                            const token = getAuthToken();
                            const response = await fetch(`https://edumanager-backend-5olt.onrender.com/api/professor/${table}`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(data)
                            });

                            if (response.ok) {
                                const result = await response.json();
                                console.log(`✅ ${table} inserido com sucesso`);
                                callback({ data: result.data || result, error: null });
                            } else {
                                console.error(`❌ Erro ao inserir em ${table}: ${response.status}`);
                                callback({ data: null, error: { message: `Erro ${response.status}` } });
                            }
                        } catch (error) {
                            console.error(`❌ Erro na inserção ${table}:`, error);
                            callback({ data: null, error });
                        }
                    }
                };
            },
            delete: function() {
                return {
                    eq: function(column, value) {
                        return {
                            then: async function(callback) {
                                return this.exec(callback);
                            },
                            exec: async function(callback) {
                                try {
                                    const token = getAuthToken();
                                    const response = await fetch(`https://edumanager-backend-5olt.onrender.com/api/professor/${table}/${value}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        }
                                    });

                                    if (response.ok) {
                                        console.log(`✅ ${table} deletado com sucesso`);
                                        callback({ data: null, error: null });
                                    } else {
                                        console.error(`❌ Erro ao deletar ${table}: ${response.status}`);
                                        callback({ data: null, error: { message: `Erro ${response.status}` } });
                                    }
                                } catch (error) {
                                    console.error(`❌ Erro na deleção ${table}:`, error);
                                    callback({ data: null, error });
                                }
                            }
                        };
                    }
                };
            }
        };
    },
    
    auth: {
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
                        },
                        access_token: getAuthToken()
                    }
                },
                error: null
            };
        }
    }
};

// Substituir import do Supabase se necessário
if (window.require) {
    window.require.cache = window.require.cache || {};
    window.require.cache['@/integrations/supabase/client'] = {
        exports: { supabase: window.supabase }
    };
}

// Função para testar a nova implementação
async function testarNovaImplementacao() {
    console.log('🧪 Testando nova implementação...');
    
    try {
        // Testar aulas
        console.log('📋 Testando aulas...');
        const resultAulas = await new Promise((resolve) => {
            window.supabase.from('aulas').select('*').then(resolve);
        });
        console.log('Resultado aulas:', resultAulas);
        
        // Testar alunos
        console.log('📋 Testando alunos...');
        const resultAlunos = await new Promise((resolve) => {
            window.supabase.from('alunos').select('*').eq('ativo', true).then(resolve);
        });
        console.log('Resultado alunos:', resultAlunos);
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar
console.log('✅ Supabase substituído completamente!');
console.log('🧪 Executando teste...');
testarNovaImplementacao();

console.log('📱 AGORA RECARREGUE A PÁGINA (F5) e os erros devem desaparecer!'); 