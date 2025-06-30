// Script para testar consultas corrigidas do Supabase
// Execute no console do navegador (F12)

console.log('🔍 TESTANDO CONSULTAS CORRIGIDAS DO SUPABASE');

async function testarConsultas() {
    try {
        // 1. Testar consulta simples de aulas (sem JOIN)
        console.log('📋 Testando consulta simples de aulas...');
        const { data: aulas, error: erroAulas } = await supabase
            .from('aulas')
            .select('*')
            .order('data_hora', { ascending: true })
            .limit(5);

        if (erroAulas) {
            console.error('❌ Erro na consulta de aulas:', erroAulas);
        } else {
            console.log('✅ Aulas encontradas:', aulas?.length || 0);
            console.log('Dados:', aulas);
        }

        // 2. Testar consulta simples de alunos (sem JOIN)
        console.log('📋 Testando consulta simples de alunos...');
        const { data: alunos, error: erroAlunos } = await supabase
            .from('alunos')
            .select('*')
            .eq('ativo', true)
            .limit(5);

        if (erroAlunos) {
            console.error('❌ Erro na consulta de alunos:', erroAlunos);
        } else {
            console.log('✅ Alunos encontrados:', alunos?.length || 0);
            console.log('Dados:', alunos);
        }

        // 3. Testar consulta de profiles
        console.log('📋 Testando consulta de profiles...');
        const { data: profiles, error: erroProfiles } = await supabase
            .from('profiles')
            .select('id, nome, email, tipo')
            .limit(5);

        if (erroProfiles) {
            console.error('❌ Erro na consulta de profiles:', erroProfiles);
        } else {
            console.log('✅ Profiles encontrados:', profiles?.length || 0);
            console.log('Dados:', profiles);
        }

        // 4. Se consultas simples funcionarem, testar JOIN específico
        if (!erroAulas && !erroAlunos) {
            console.log('📋 Testando JOIN específico para aulas...');
            const { data: aulasComAluno, error: erroJoin } = await supabase
                .from('aulas')
                .select(`
                    *,
                    aluno_profile:profiles!aulas_aluno_id_fkey(nome, email)
                `)
                .limit(3);

            if (erroJoin) {
                console.error('❌ Erro no JOIN de aulas:', erroJoin);
                console.log('💡 Usando consultas separadas será mais seguro');
            } else {
                console.log('✅ JOIN de aulas funcionou!');
                console.log('Dados:', aulasComAluno);
            }
        }

        // 5. Verificar se usuário está autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.error('❌ Erro de autenticação:', authError);
        } else if (user) {
            console.log('✅ Usuário autenticado:', user.id);
        } else {
            console.log('⚠️ Usuário não autenticado');
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Executar teste
testarConsultas();

// Função para testar consulta específica
window.testarConsultaEspecifica = function(tabela, colunas = '*') {
    console.log(`🔍 Testando consulta na tabela: ${tabela}`);
    
    return supabase
        .from(tabela)
        .select(colunas)
        .limit(3)
        .then(({ data, error }) => {
            if (error) {
                console.error(`❌ Erro na tabela ${tabela}:`, error);
            } else {
                console.log(`✅ Dados da tabela ${tabela}:`, data);
            }
            return { data, error };
        });
};

console.log('💡 Use: testarConsultaEspecifica("nome_da_tabela") para testar uma tabela específica'); 