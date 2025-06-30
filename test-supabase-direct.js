// Script para testar conectividade direta com Supabase
// Execute no console do navegador (F12)

console.log('🔍 TESTANDO CONECTIVIDADE SUPABASE DIRETA');

// 1. Verificar se o cliente Supabase existe
if (typeof supabase !== 'undefined') {
    console.log('✅ Cliente Supabase encontrado');
    
    // 2. Testar autenticação
    supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
            console.error('❌ Erro de sessão:', error);
        } else if (session) {
            console.log('✅ Sessão ativa:', session.user.id);
            
            // 3. Testar consultas diretas
            console.log('🔍 Testando consulta à tabela aulas...');
            
            supabase
                .from('aulas')
                .select('*')
                .limit(5)
                .then(({ data, error }) => {
                    if (error) {
                        console.error('❌ Erro na consulta aulas:', error);
                        console.error('Detalhes:', error.message);
                        console.error('Código:', error.code);
                        console.error('Hint:', error.hint);
                    } else {
                        console.log('✅ Aulas encontradas:', data?.length || 0);
                        console.log('Dados:', data);
                    }
                });
                
            console.log('🔍 Testando consulta à tabela alunos...');
            
            supabase
                .from('alunos')
                .select('*')
                .limit(5)
                .then(({ data, error }) => {
                    if (error) {
                        console.error('❌ Erro na consulta alunos:', error);
                        console.error('Detalhes:', error.message);
                        console.error('Código:', error.code);
                        console.error('Hint:', error.hint);
                    } else {
                        console.log('✅ Alunos encontrados:', data?.length || 0);
                        console.log('Dados:', data);
                    }
                });
                
        } else {
            console.error('❌ Nenhuma sessão ativa');
        }
    });
} else {
    console.error('❌ Cliente Supabase não encontrado');
}

// 4. Verificar URL e configuração
console.log('🔍 Configuração Supabase:');
console.log('URL:', window.location.origin);
console.log('Supabase URL esperada: https://qyaorhetkrgmkrtzjpvm.supabase.co'); 