const { supabaseAdmin } = require('./config/supabase');

async function verifyTableStructure() {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA DA TABELA ALUNOS...\n');
    
    // Primeiro, vamos fazer uma query simples para ver quais colunas existem
    const { data: sample, error: sampleError } = await supabaseAdmin
      .from('alunos')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.log('❌ Erro na consulta simples:', sampleError.message);
    } else {
      console.log('✅ Consulta simples funcionou!');
      if (sample && sample.length > 0) {
        console.log('🗂️ Colunas encontradas na tabela alunos:');
        console.log(Object.keys(sample[0]));
        console.log('\n📋 Dados de exemplo:');
        console.log(JSON.stringify(sample[0], null, 2));
      } else {
        console.log('📋 Tabela alunos está vazia');
      }
    }
    
    // Testar query sem a coluna problemática
    console.log('\n🧪 TESTANDO QUERY CORRIGIDA...\n');
    
    const { data: alunos, error: alunosError } = await supabaseAdmin
      .from('alunos')
      .select(`
        id,
        aluno_id,
        professor_id,
        observacoes,
        ativo,
        created_at,
        aluno_profile:profiles!alunos_aluno_id_fkey(
          id,
          nome,
          email,
          telefone
        )
      `)
      .eq('professor_id', 'e650f5ee-747b-4574-9bfa-8e2d411c4974')
      .eq('ativo', true)
      .limit(5);
    
    if (alunosError) {
      console.log('❌ Erro na query corrigida:', alunosError.message);
    } else {
      console.log('✅ Query corrigida funcionou!');
      console.log('📊 Alunos encontrados:', alunos?.length || 0);
      if (alunos && alunos.length > 0) {
        console.log('📋 Dados dos alunos:');
        console.log(JSON.stringify(alunos, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  process.exit(0);
}

verifyTableStructure(); 